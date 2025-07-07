use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use anchor_spl::associated_token::AssociatedToken;
use std::mem::size_of;

declare_id!("5X9KmqJtJbNrfvA3p8X4A3d4YQ9ZqXqQzJZQzJZQzJZQ");

#[program]
pub mod nocturne_swap {
    use super::*;

    pub fn initialize_pool(
        ctx: Context<InitializePool>,
        fee_rate: u64, // Fee rate in basis points (100 = 1%)
    ) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        pool.authority = ctx.accounts.authority.key();
        pool.token_a_mint = ctx.accounts.token_a_mint.key();
        pool.token_b_mint = ctx.accounts.token_b_mint.key();
        pool.token_a_vault = ctx.accounts.token_a_vault.key();
        pool.token_b_vault = ctx.accounts.token_b_vault.key();
        pool.fee_rate = fee_rate;
        pool.bump = ctx.bumps.pool;
        
        msg!("NocturneSwap pool initialized for tokens {} and {}", 
             pool.token_a_mint, pool.token_b_mint);
        Ok(())
    }

    pub fn swap(
        ctx: Context<Swap>,
        amount_in: u64,
        minimum_amount_out: u64,
        is_a_to_b: bool,
    ) -> Result<()> {
        let pool = &ctx.accounts.pool;
        
        // Calculate swap amounts with slippage protection
        let (amount_out, fee_amount) = calculate_swap_amounts(
            amount_in,
            ctx.accounts.vault_in.amount,
            ctx.accounts.vault_out.amount,
            pool.fee_rate,
        )?;

        require!(
            amount_out >= minimum_amount_out,
            SwapError::SlippageExceeded
        );

        // Transfer tokens from user to pool
        let transfer_in = Transfer {
            from: ctx.accounts.user_token_in.to_account_info(),
            to: ctx.accounts.vault_in.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        token::transfer(
            CpiContext::new(ctx.accounts.token_program.to_account_info(), transfer_in),
            amount_in,
        )?;

        // Transfer tokens from pool to user
        let authority_seeds = &[
            b"pool",
            pool.token_a_mint.as_ref(),
            pool.token_b_mint.as_ref(),
            &[pool.bump],
        ];
        let signer_seeds = &[&authority_seeds[..]];

        let transfer_out = Transfer {
            from: ctx.accounts.vault_out.to_account_info(),
            to: ctx.accounts.user_token_out.to_account_info(),
            authority: ctx.accounts.pool.to_account_info(),
        };
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                transfer_out,
                signer_seeds,
            ),
            amount_out,
        )?;

        emit!(SwapEvent {
            user: ctx.accounts.user.key(),
            token_in: if is_a_to_b { pool.token_a_mint } else { pool.token_b_mint },
            token_out: if is_a_to_b { pool.token_b_mint } else { pool.token_a_mint },
            amount_in,
            amount_out,
            fee_amount,
        });

        msg!("Swap completed: {} tokens in, {} tokens out", amount_in, amount_out);
        Ok(())
    }

    pub fn add_liquidity(
        ctx: Context<AddLiquidity>,
        amount_a: u64,
        amount_b: u64,
        min_liquidity: u64,
    ) -> Result<()> {
        let pool = &ctx.accounts.pool;
        
        // For simplicity, we'll use a 1:1 ratio for initial liquidity
        // In a production DEX, you'd implement proper AMM calculations
        let liquidity_tokens = std::cmp::min(amount_a, amount_b);
        
        require!(
            liquidity_tokens >= min_liquidity,
            SwapError::InsufficientLiquidity
        );

        // Transfer tokens from user to pool
        let transfer_a = Transfer {
            from: ctx.accounts.user_token_a.to_account_info(),
            to: ctx.accounts.vault_a.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        token::transfer(
            CpiContext::new(ctx.accounts.token_program.to_account_info(), transfer_a),
            amount_a,
        )?;

        let transfer_b = Transfer {
            from: ctx.accounts.user_token_b.to_account_info(),
            to: ctx.accounts.vault_b.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        token::transfer(
            CpiContext::new(ctx.accounts.token_program.to_account_info(), transfer_b),
            amount_b,
        )?;

        msg!("Liquidity added: {} token A, {} token B", amount_a, amount_b);
        Ok(())
    }
}

// Helper function to calculate swap amounts using constant product formula
fn calculate_swap_amounts(
    amount_in: u64,
    reserve_in: u64,
    reserve_out: u64,
    fee_rate: u64,
) -> Result<(u64, u64)> {
    require!(reserve_in > 0 && reserve_out > 0, SwapError::InsufficientLiquidity);
    
    // Calculate fee (fee_rate is in basis points, 10000 = 100%)
    let fee_amount = amount_in
        .checked_mul(fee_rate)
        .ok_or(SwapError::Overflow)?
        .checked_div(10000)
        .ok_or(SwapError::Overflow)?;
    
    let amount_in_with_fee = amount_in
        .checked_sub(fee_amount)
        .ok_or(SwapError::Overflow)?;
    
    // Constant product formula: (x + dx) * (y - dy) = x * y
    // dy = (y * dx) / (x + dx)
    let numerator = (reserve_out as u128)
        .checked_mul(amount_in_with_fee as u128)
        .ok_or(SwapError::Overflow)?;
    
    let denominator = (reserve_in as u128)
        .checked_add(amount_in_with_fee as u128)
        .ok_or(SwapError::Overflow)?;
    
    let amount_out = numerator
        .checked_div(denominator)
        .ok_or(SwapError::Overflow)? as u64;
    
    Ok((amount_out, fee_amount))
}

#[derive(Accounts)]
pub struct InitializePool<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        init,
        payer = authority,
        space = 8 + size_of::<Pool>(),
        seeds = [b"pool", token_a_mint.key().as_ref(), token_b_mint.key().as_ref()],
        bump
    )]
    pub pool: Account<'info, Pool>,
    
    pub token_a_mint: Account<'info, token::Mint>,
    pub token_b_mint: Account<'info, token::Mint>,
    
    #[account(
        init,
        payer = authority,
        token::mint = token_a_mint,
        token::authority = pool,
    )]
    pub token_a_vault: Account<'info, TokenAccount>,
    
    #[account(
        init,
        payer = authority,
        token::mint = token_b_mint,
        token::authority = pool,
    )]
    pub token_b_vault: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct Swap<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"pool", pool.token_a_mint.as_ref(), pool.token_b_mint.as_ref()],
        bump = pool.bump
    )]
    pub pool: Account<'info, Pool>,
    
    #[account(mut)]
    pub user_token_in: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub user_token_out: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub vault_in: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub vault_out: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct AddLiquidity<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"pool", pool.token_a_mint.as_ref(), pool.token_b_mint.as_ref()],
        bump = pool.bump
    )]
    pub pool: Account<'info, Pool>,
    
    #[account(mut)]
    pub user_token_a: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub user_token_b: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub vault_a: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub vault_b: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct Pool {
    pub authority: Pubkey,
    pub token_a_mint: Pubkey,
    pub token_b_mint: Pubkey,
    pub token_a_vault: Pubkey,
    pub token_b_vault: Pubkey,
    pub fee_rate: u64, // Fee rate in basis points
    pub bump: u8,
}

#[event]
pub struct SwapEvent {
    pub user: Pubkey,
    pub token_in: Pubkey,
    pub token_out: Pubkey,
    pub amount_in: u64,
    pub amount_out: u64,
    pub fee_amount: u64,
}

#[error_code]
pub enum SwapError {
    #[msg("Slippage tolerance exceeded")]
    SlippageExceeded,
    #[msg("Insufficient liquidity")]
    InsufficientLiquidity,
    #[msg("Arithmetic overflow")]
    Overflow,
    #[msg("Invalid token pair")]
    InvalidTokenPair,
}
