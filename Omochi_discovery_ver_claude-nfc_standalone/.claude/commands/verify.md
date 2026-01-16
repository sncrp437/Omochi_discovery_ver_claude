---
description: Verify code quality and security aspects of the codebase
allowed-tools: Read, Glob, Grep, Task
argument-hint: [file-path or area to focus on]
---

## Task

Perform a comprehensive code and security verification on this codebase.

$ARGUMENTS

## Verification Checklist

### 1. Security Review
- **XSS vulnerabilities**: Check for unsanitized innerHTML, document.write, or eval usage
- **Injection risks**: Review any dynamic HTML generation for proper escaping
- **External resources**: Verify all external scripts/iframes are from trusted sources
- **API endpoints**: Check exposed API URLs for sensitive data leakage
- **CORS issues**: Review fetch/AJAX calls for proper CORS handling
- **Secrets exposure**: Look for hardcoded API keys, tokens, or credentials

### 2. Code Quality
- **Error handling**: Check for try/catch blocks around async operations
- **Input validation**: Verify user inputs are validated before use
- **Memory leaks**: Look for event listeners not being removed, or streams not closed
- **Performance**: Identify inefficient loops, unnecessary DOM queries, or blocking operations
- **Dead code**: Find unused functions, variables, or imports

### 3. Browser Compatibility
- **Modern API usage**: Check for APIs that may not work on older browsers
- **CSS compatibility**: Look for vendor prefixes or unsupported properties
- **Mobile responsiveness**: Verify touch events and viewport handling

### 4. Best Practices
- **Consistent naming**: Check for consistent variable/function naming conventions
- **Code duplication**: Identify repeated code that could be refactored
- **Comments**: Verify critical logic is documented
- **Accessibility**: Check for proper ARIA labels and keyboard navigation

## Output Format

Provide findings in this format:

### Critical Issues (Must Fix)
- Issue description with file:line reference
- Recommended fix

### Warnings (Should Fix)
- Issue description with file:line reference
- Recommended fix

### Suggestions (Nice to Have)
- Improvement suggestions

### Summary
- Overall code health assessment
- Priority recommendations
