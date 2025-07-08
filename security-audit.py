#!/usr/bin/env python3
"""
Security Audit & Vulnerability Scanner for NocturneSwap
Comprehensive security assessment and audit preparation
"""

import os
import re
import json
import hashlib
import subprocess
from pathlib import Path
from typing import Dict, List, Any, Tuple
from datetime import datetime

class NocturneSecurityAuditor:
    def __init__(self, base_path: str = "."):
        self.base_path = Path(base_path)
        self.audit_results = {
            "timestamp": datetime.now().isoformat(),
            "version": "1.0.0",
            "overall_score": 0,
            "categories": {},
            "vulnerabilities": [],
            "recommendations": [],
            "compliant_items": []
        }
        
        print("🛡️ NocturneSwap Security Auditor")
        print("=" * 40)
    
    def run_full_audit(self) -> Dict[str, Any]:
        """Run comprehensive security audit"""
        try:
            print("🔍 Starting comprehensive security audit...")
            
            # Frontend Security Audit
            print("\n🌐 Auditing Frontend Security...")
            self.audit_frontend_security()
            
            # Smart Contract Security Audit
            print("\n⛓️ Auditing Smart Contract Security...")
            self.audit_smart_contract_security()
            
            # Infrastructure Security Audit
            print("\n🏗️ Auditing Infrastructure Security...")
            self.audit_infrastructure_security()
            
            # Dependency Security Audit
            print("\n📦 Auditing Dependencies...")
            self.audit_dependencies()
            
            # Configuration Security Audit
            print("\n⚙️ Auditing Configuration Security...")
            self.audit_configuration_security()
            
            # Generate final report
            self.generate_audit_report()
            
            print(f"\n✅ Security audit complete!")
            print(f"📊 Overall Security Score: {self.audit_results['overall_score']}/100")
            
            return self.audit_results
            
        except Exception as e:
            print(f"❌ Security audit failed: {e}")
            return {"error": str(e)}
    
    def audit_frontend_security(self) -> None:
        """Audit frontend security vulnerabilities"""
        vulnerabilities = []
        compliant_items = []
        
        # Check for XSS vulnerabilities
        xss_results = self.check_xss_vulnerabilities()
        vulnerabilities.extend(xss_results['vulnerabilities'])
        compliant_items.extend(xss_results['compliant'])
        
        # Check for CSRF protection
        csrf_results = self.check_csrf_protection()
        vulnerabilities.extend(csrf_results['vulnerabilities'])
        compliant_items.extend(csrf_results['compliant'])
        
        # Check for secure headers
        header_results = self.check_security_headers()
        vulnerabilities.extend(header_results['vulnerabilities'])
        compliant_items.extend(header_results['compliant'])
        
        # Check for sensitive data exposure
        data_results = self.check_sensitive_data_exposure()
        vulnerabilities.extend(data_results['vulnerabilities'])
        compliant_items.extend(data_results['compliant'])
        
        # Check for secure communication
        comm_results = self.check_secure_communication()
        vulnerabilities.extend(comm_results['vulnerabilities'])
        compliant_items.extend(comm_results['compliant'])
        
        self.audit_results['categories']['frontend'] = {
            'score': self.calculate_category_score(vulnerabilities, compliant_items),
            'vulnerabilities': len(vulnerabilities),
            'compliant_items': len(compliant_items)
        }
        
        self.audit_results['vulnerabilities'].extend(vulnerabilities)
        self.audit_results['compliant_items'].extend(compliant_items)
    
    def check_xss_vulnerabilities(self) -> Dict[str, List]:
        """Check for XSS vulnerabilities"""
        vulnerabilities = []
        compliant_items = []
        
        # Scan HTML and JS files
        html_files = list(self.base_path.glob("**/*.html"))
        js_files = list(self.base_path.glob("**/*.js"))
        
        # XSS patterns to look for
        xss_patterns = [
            r'innerHTML\s*=.*\+',  # Dangerous innerHTML usage
            r'document\.write\s*\(',  # Dangerous document.write
            r'eval\s*\(',  # Dangerous eval
            r'\.html\s*\(.*\+',  # jQuery HTML with concatenation
            r'v-html\s*=',  # Vue.js v-html directive
        ]
        
        all_files = html_files + js_files
        
        for file_path in all_files:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                for pattern in xss_patterns:
                    matches = re.finditer(pattern, content, re.IGNORECASE)
                    for match in matches:
                        line_num = content[:match.start()].count('\n') + 1
                        vulnerabilities.append({
                            'type': 'XSS',
                            'severity': 'HIGH',
                            'file': str(file_path.relative_to(self.base_path)),
                            'line': line_num,
                            'description': f'Potential XSS vulnerability: {match.group()}',
                            'recommendation': 'Use proper input sanitization and avoid dangerous DOM manipulation'
                        })
                
                # Check for proper escaping
                if 'textContent' in content or 'innerText' in content:
                    compliant_items.append({
                        'type': 'XSS_PROTECTION',
                        'file': str(file_path.relative_to(self.base_path)),
                        'description': 'Uses safe DOM text methods'
                    })
                    
            except Exception as e:
                print(f"  ⚠️ Could not scan {file_path}: {e}")
        
        return {'vulnerabilities': vulnerabilities, 'compliant': compliant_items}
    
    def check_csrf_protection(self) -> Dict[str, List]:
        """Check for CSRF protection measures"""
        vulnerabilities = []
        compliant_items = []
        
        # Check for CSRF tokens in forms
        html_files = list(self.base_path.glob("**/*.html"))
        
        for file_path in html_files:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Look for forms without CSRF protection
                form_matches = re.finditer(r'<form[^>]*>', content, re.IGNORECASE)
                csrf_tokens = re.findall(r'csrf[_-]?token', content, re.IGNORECASE)
                
                if form_matches and not csrf_tokens:
                    vulnerabilities.append({
                        'type': 'CSRF',
                        'severity': 'MEDIUM',
                        'file': str(file_path.relative_to(self.base_path)),
                        'description': 'Forms found without CSRF protection',
                        'recommendation': 'Implement CSRF tokens for all state-changing operations'
                    })
                elif csrf_tokens:
                    compliant_items.append({
                        'type': 'CSRF_PROTECTION',
                        'file': str(file_path.relative_to(self.base_path)),
                        'description': 'CSRF protection implemented'
                    })
                    
            except Exception as e:
                print(f"  ⚠️ Could not scan {file_path}: {e}")
        
        return {'vulnerabilities': vulnerabilities, 'compliant': compliant_items}
    
    def check_security_headers(self) -> Dict[str, List]:
        """Check for security headers implementation"""
        vulnerabilities = []
        compliant_items = []
        
        # Required security headers
        required_headers = [
            'Content-Security-Policy',
            'X-Frame-Options',
            'X-Content-Type-Options',
            'Referrer-Policy',
            'Permissions-Policy'
        ]
        
        # Check if headers are configured
        config_files = [
            self.base_path / 'vercel.json',
            self.base_path / '.htaccess',
            self.base_path / 'netlify.toml'
        ]
        
        headers_found = []
        
        for config_file in config_files:
            if config_file.exists():
                try:
                    with open(config_file, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    for header in required_headers:
                        if header.lower() in content.lower():
                            headers_found.append(header)
                            compliant_items.append({
                                'type': 'SECURITY_HEADER',
                                'file': str(config_file.relative_to(self.base_path)),
                                'description': f'{header} header configured'
                            })
                            
                except Exception as e:
                    print(f"  ⚠️ Could not scan {config_file}: {e}")
        
        # Check for missing headers
        for header in required_headers:
            if header not in headers_found:
                vulnerabilities.append({
                    'type': 'MISSING_HEADER',
                    'severity': 'MEDIUM',
                    'description': f'Missing security header: {header}',
                    'recommendation': f'Configure {header} header in your web server'
                })
        
        return {'vulnerabilities': vulnerabilities, 'compliant': compliant_items}
    
    def check_sensitive_data_exposure(self) -> Dict[str, List]:
        """Check for sensitive data exposure"""
        vulnerabilities = []
        compliant_items = []
        
        # Patterns for sensitive data
        sensitive_patterns = [
            (r'password\s*[:=]\s*["\'][^"\']{1,}["\']', 'Hardcoded password'),
            (r'api[_-]?key\s*[:=]\s*["\'][^"\']{10,}["\']', 'Hardcoded API key'),
            (r'secret\s*[:=]\s*["\'][^"\']{10,}["\']', 'Hardcoded secret'),
            (r'private[_-]?key\s*[:=]\s*["\'][^"\']{20,}["\']', 'Hardcoded private key'),
            (r'token\s*[:=]\s*["\'][^"\']{20,}["\']', 'Hardcoded token'),
        ]
        
        # Scan all text files
        text_files = []
        for ext in ['*.js', '*.html', '*.json', '*.env', '*.config', '*.py']:
            text_files.extend(list(self.base_path.glob(f"**/{ext}")))
        
        for file_path in text_files:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                for pattern, description in sensitive_patterns:
                    matches = re.finditer(pattern, content, re.IGNORECASE)
                    for match in matches:
                        line_num = content[:match.start()].count('\n') + 1
                        vulnerabilities.append({
                            'type': 'SENSITIVE_DATA',
                            'severity': 'HIGH',
                            'file': str(file_path.relative_to(self.base_path)),
                            'line': line_num,
                            'description': description,
                            'recommendation': 'Move sensitive data to environment variables'
                        })
                
                # Check for environment variable usage (good practice)
                if 'process.env' in content or 'process.env.' in content:
                    compliant_items.append({
                        'type': 'ENV_VARS',
                        'file': str(file_path.relative_to(self.base_path)),
                        'description': 'Uses environment variables for configuration'
                    })
                    
            except Exception as e:
                print(f"  ⚠️ Could not scan {file_path}: {e}")
        
        return {'vulnerabilities': vulnerabilities, 'compliant': compliant_items}
    
    def check_secure_communication(self) -> Dict[str, List]:
        """Check for secure communication practices"""
        vulnerabilities = []
        compliant_items = []
        
        # Scan for HTTP URLs (should be HTTPS)
        text_files = []
        for ext in ['*.js', '*.html', '*.json']:
            text_files.extend(list(self.base_path.glob(f"**/{ext}")))
        
        for file_path in text_files:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Check for insecure HTTP URLs
                http_matches = re.finditer(r'http://[^\s"\'<>]+', content)
                for match in matches:
                    if 'localhost' not in match.group() and '127.0.0.1' not in match.group():
                        line_num = content[:match.start()].count('\n') + 1
                        vulnerabilities.append({
                            'type': 'INSECURE_URL',
                            'severity': 'MEDIUM',
                            'file': str(file_path.relative_to(self.base_path)),
                            'line': line_num,
                            'description': f'Insecure HTTP URL: {match.group()}',
                            'recommendation': 'Use HTTPS URLs for external resources'
                        })
                
                # Check for HTTPS usage (good practice)
                https_count = len(re.findall(r'https://', content))
                if https_count > 0:
                    compliant_items.append({
                        'type': 'HTTPS_USAGE',
                        'file': str(file_path.relative_to(self.base_path)),
                        'description': f'Uses HTTPS for {https_count} external resources'
                    })
                    
            except Exception as e:
                print(f"  ⚠️ Could not scan {file_path}: {e}")
        
        return {'vulnerabilities': vulnerabilities, 'compliant': compliant_items}
    
    def audit_smart_contract_security(self) -> None:
        """Audit smart contract security"""
        vulnerabilities = []
        compliant_items = []
        
        # Find Rust contract files
        rust_files = list(self.base_path.glob("**/*.rs"))
        
        if not rust_files:
            vulnerabilities.append({
                'type': 'NO_CONTRACTS',
                'severity': 'INFO',
                'description': 'No Rust smart contract files found',
                'recommendation': 'Ensure smart contracts are included in the audit scope'
            })
        
        for rust_file in rust_files:
            try:
                with open(rust_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Check for common Solana/Anchor security issues
                self.check_anchor_security_patterns(rust_file, content, vulnerabilities, compliant_items)
                
            except Exception as e:
                print(f"  ⚠️ Could not scan {rust_file}: {e}")
        
        self.audit_results['categories']['smart_contracts'] = {
            'score': self.calculate_category_score(vulnerabilities, compliant_items),
            'vulnerabilities': len(vulnerabilities),
            'compliant_items': len(compliant_items)
        }
        
        self.audit_results['vulnerabilities'].extend(vulnerabilities)
        self.audit_results['compliant_items'].extend(compliant_items)
    
    def check_anchor_security_patterns(self, file_path: Path, content: str, vulnerabilities: List, compliant_items: List) -> None:
        """Check for Anchor-specific security patterns"""
        
        # Check for proper access controls
        if '#[access_control(' in content:
            compliant_items.append({
                'type': 'ACCESS_CONTROL',
                'file': str(file_path.relative_to(self.base_path)),
                'description': 'Implements access control checks'
            })
        
        # Check for overflow protection
        if 'checked_add' in content or 'checked_sub' in content or 'checked_mul' in content:
            compliant_items.append({
                'type': 'OVERFLOW_PROTECTION',
                'file': str(file_path.relative_to(self.base_path)),
                'description': 'Uses checked arithmetic operations'
            })
        
        # Check for proper error handling
        if 'Result<' in content and 'Error' in content:
            compliant_items.append({
                'type': 'ERROR_HANDLING',
                'file': str(file_path.relative_to(self.base_path)),
                'description': 'Implements proper error handling'
            })
        
        # Check for dangerous patterns
        dangerous_patterns = [
            (r'unwrap\(\)', 'Use of unwrap() can cause panics'),
            (r'expect\([^)]*\)', 'Use of expect() can cause panics'),
            (r'to_account_info\(\)\.try_borrow_mut_data\(\)', 'Direct data borrowing without checks'),
        ]
        
        for pattern, description in dangerous_patterns:
            matches = re.finditer(pattern, content)
            for match in matches:
                line_num = content[:match.start()].count('\n') + 1
                vulnerabilities.append({
                    'type': 'DANGEROUS_PATTERN',
                    'severity': 'MEDIUM',
                    'file': str(file_path.relative_to(self.base_path)),
                    'line': line_num,
                    'description': description,
                    'recommendation': 'Use safer alternatives with proper error handling'
                })
    
    def audit_infrastructure_security(self) -> None:
        """Audit infrastructure security"""
        vulnerabilities = []
        compliant_items = []
        
        # Check deployment configurations
        config_files = [
            'vercel.json',
            'netlify.toml',
            'Dockerfile',
            'docker-compose.yml'
        ]
        
        for config_file in config_files:
            file_path = self.base_path / config_file
            if file_path.exists():
                compliant_items.append({
                    'type': 'DEPLOYMENT_CONFIG',
                    'file': config_file,
                    'description': f'Has deployment configuration: {config_file}'
                })
        
        # Check for .gitignore
        gitignore_path = self.base_path / '.gitignore'
        if gitignore_path.exists():
            compliant_items.append({
                'type': 'GITIGNORE',
                'file': '.gitignore',
                'description': 'Has .gitignore file to prevent sensitive file commits'
            })
        else:
            vulnerabilities.append({
                'type': 'MISSING_GITIGNORE',
                'severity': 'MEDIUM',
                'description': 'Missing .gitignore file',
                'recommendation': 'Add .gitignore to prevent committing sensitive files'
            })
        
        self.audit_results['categories']['infrastructure'] = {
            'score': self.calculate_category_score(vulnerabilities, compliant_items),
            'vulnerabilities': len(vulnerabilities),
            'compliant_items': len(compliant_items)
        }
        
        self.audit_results['vulnerabilities'].extend(vulnerabilities)
        self.audit_results['compliant_items'].extend(compliant_items)
    
    def audit_dependencies(self) -> None:
        """Audit dependency security"""
        vulnerabilities = []
        compliant_items = []
        
        # Check package.json for vulnerabilities
        package_files = list(self.base_path.glob("**/package.json"))
        
        for package_file in package_files:
            try:
                with open(package_file, 'r', encoding='utf-8') as f:
                    package_data = json.load(f)
                
                dependencies = package_data.get('dependencies', {})
                dev_dependencies = package_data.get('devDependencies', {})
                
                # Check for known vulnerable packages
                vulnerable_packages = [
                    'lodash',  # Often has vulnerabilities
                    'moment',  # Deprecated, should use dayjs
                    'request'  # Deprecated
                ]
                
                all_deps = {**dependencies, **dev_dependencies}
                
                for pkg_name in vulnerable_packages:
                    if pkg_name in all_deps:
                        vulnerabilities.append({
                            'type': 'VULNERABLE_DEPENDENCY',
                            'severity': 'MEDIUM',
                            'file': str(package_file.relative_to(self.base_path)),
                            'description': f'Potentially vulnerable dependency: {pkg_name}',
                            'recommendation': f'Consider replacing {pkg_name} with a safer alternative'
                        })
                
                # Check for package-lock.json
                lock_file = package_file.parent / 'package-lock.json'
                if lock_file.exists():
                    compliant_items.append({
                        'type': 'DEPENDENCY_LOCK',
                        'file': str(package_file.relative_to(self.base_path)),
                        'description': 'Has package-lock.json for dependency integrity'
                    })
                else:
                    vulnerabilities.append({
                        'type': 'MISSING_LOCK_FILE',
                        'severity': 'LOW',
                        'file': str(package_file.relative_to(self.base_path)),
                        'description': 'Missing package-lock.json',
                        'recommendation': 'Commit package-lock.json for reproducible builds'
                    })
                    
            except Exception as e:
                print(f"  ⚠️ Could not scan {package_file}: {e}")
        
        self.audit_results['categories']['dependencies'] = {
            'score': self.calculate_category_score(vulnerabilities, compliant_items),
            'vulnerabilities': len(vulnerabilities),
            'compliant_items': len(compliant_items)
        }
        
        self.audit_results['vulnerabilities'].extend(vulnerabilities)
        self.audit_results['compliant_items'].extend(compliant_items)
    
    def audit_configuration_security(self) -> None:
        """Audit configuration security"""
        vulnerabilities = []
        compliant_items = []
        
        # Check for secure defaults
        config_files = [
            'vercel.json',
            'netlify.toml',
            'tsconfig.json'
        ]
        
        for config_file in config_files:
            file_path = self.base_path / config_file
            if file_path.exists():
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # Check for security-related configurations
                    if 'security' in content.lower() or 'header' in content.lower():
                        compliant_items.append({
                            'type': 'SECURITY_CONFIG',
                            'file': config_file,
                            'description': 'Contains security-related configuration'
                        })
                        
                except Exception as e:
                    print(f"  ⚠️ Could not scan {config_file}: {e}")
        
        self.audit_results['categories']['configuration'] = {
            'score': self.calculate_category_score(vulnerabilities, compliant_items),
            'vulnerabilities': len(vulnerabilities),
            'compliant_items': len(compliant_items)
        }
        
        self.audit_results['vulnerabilities'].extend(vulnerabilities)
        self.audit_results['compliant_items'].extend(compliant_items)
    
    def calculate_category_score(self, vulnerabilities: List, compliant_items: List) -> int:
        """Calculate security score for a category"""
        if not vulnerabilities and not compliant_items:
            return 50  # Neutral score if no data
        
        # Weight vulnerabilities by severity
        severity_weights = {'HIGH': 10, 'MEDIUM': 5, 'LOW': 2, 'INFO': 1}
        vulnerability_penalty = sum(severity_weights.get(v.get('severity', 'LOW'), 2) for v in vulnerabilities)
        
        # Each compliant item adds points
        compliant_points = len(compliant_items) * 3
        
        # Calculate score (max 100)
        base_score = 100
        final_score = max(0, min(100, base_score - vulnerability_penalty + compliant_points))
        
        return final_score
    
    def generate_audit_report(self) -> None:
        """Generate comprehensive audit report"""
        
        # Calculate overall score
        category_scores = [cat['score'] for cat in self.audit_results['categories'].values()]
        self.audit_results['overall_score'] = int(sum(category_scores) / len(category_scores)) if category_scores else 0
        
        # Generate recommendations
        self.generate_recommendations()
        
        # Save audit report
        report_path = self.base_path / 'security-audit-report.json'
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(self.audit_results, f, indent=2)
        
        # Generate human-readable report
        self.generate_human_readable_report()
        
        print(f"  📊 Audit report saved to: {report_path}")
    
    def generate_recommendations(self) -> None:
        """Generate security recommendations"""
        recommendations = []
        
        # High-priority recommendations
        high_vulns = [v for v in self.audit_results['vulnerabilities'] if v.get('severity') == 'HIGH']
        if high_vulns:
            recommendations.append({
                'priority': 'HIGH',
                'title': 'Address High-Severity Vulnerabilities',
                'description': f'Fix {len(high_vulns)} high-severity vulnerabilities immediately',
                'action': 'Review and fix all HIGH severity issues before deployment'
            })
        
        # Security headers recommendation
        header_vulns = [v for v in self.audit_results['vulnerabilities'] if v.get('type') == 'MISSING_HEADER']
        if header_vulns:
            recommendations.append({
                'priority': 'MEDIUM',
                'title': 'Implement Security Headers',
                'description': 'Add missing security headers to protect against common attacks',
                'action': 'Configure CSP, X-Frame-Options, and other security headers'
            })
        
        # Dependency recommendations
        dep_vulns = [v for v in self.audit_results['vulnerabilities'] if 'DEPENDENCY' in v.get('type', '')]
        if dep_vulns:
            recommendations.append({
                'priority': 'MEDIUM',
                'title': 'Update Dependencies',
                'description': 'Update or replace vulnerable dependencies',
                'action': 'Run npm audit and update packages'
            })
        
        self.audit_results['recommendations'] = recommendations
    
    def generate_human_readable_report(self) -> None:
        """Generate human-readable audit report"""
        report_lines = [
            "🛡️ NOCTURNESWAP SECURITY AUDIT REPORT",
            "=" * 50,
            f"Audit Date: {self.audit_results['timestamp']}",
            f"Overall Security Score: {self.audit_results['overall_score']}/100",
            "",
            "📊 CATEGORY SCORES:",
        ]
        
        for category, data in self.audit_results['categories'].items():
            report_lines.append(f"  {category.title()}: {data['score']}/100 ({data['vulnerabilities']} issues, {data['compliant_items']} compliant)")
        
        report_lines.extend([
            "",
            "🚨 VULNERABILITIES SUMMARY:",
            f"  Total Issues: {len(self.audit_results['vulnerabilities'])}",
        ])
        
        # Group by severity
        severity_counts = {}
        for vuln in self.audit_results['vulnerabilities']:
            severity = vuln.get('severity', 'UNKNOWN')
            severity_counts[severity] = severity_counts.get(severity, 0) + 1
        
        for severity, count in sorted(severity_counts.items(), key=lambda x: {'HIGH': 4, 'MEDIUM': 3, 'LOW': 2, 'INFO': 1}.get(x[0], 0), reverse=True):
            report_lines.append(f"  {severity}: {count}")
        
        report_lines.extend([
            "",
            "✅ SECURITY STRENGTHS:",
            f"  Total Compliant Items: {len(self.audit_results['compliant_items'])}",
            "",
            "🎯 TOP RECOMMENDATIONS:",
        ])
        
        for i, rec in enumerate(self.audit_results['recommendations'][:3], 1):
            report_lines.append(f"  {i}. [{rec['priority']}] {rec['title']}")
            report_lines.append(f"     {rec['description']}")
        
        # Save human-readable report
        report_path = self.base_path / 'SECURITY_AUDIT_REPORT.md'
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(report_lines))
        
        print(f"  📄 Human-readable report saved to: {report_path}")

def main():
    """Main audit function"""
    try:
        auditor = NocturneSecurityAuditor()
        results = auditor.run_full_audit()
        
        if 'error' not in results:
            score = results['overall_score']
            if score >= 80:
                print(f"\n🎉 Excellent security score: {score}/100")
                print("✅ NocturneSwap is ready for production deployment!")
            elif score >= 60:
                print(f"\n⚠️ Good security score: {score}/100")
                print("🔧 Address medium-priority issues before deployment")
            else:
                print(f"\n❌ Security score needs improvement: {score}/100")
                print("🚨 Address high-priority vulnerabilities before deployment")
            
            return 0
        else:
            print(f"\n❌ Audit failed: {results['error']}")
            return 1
            
    except Exception as e:
        print(f"❌ Security audit error: {e}")
        return 1

if __name__ == "__main__":
    import sys
    sys.exit(main())
