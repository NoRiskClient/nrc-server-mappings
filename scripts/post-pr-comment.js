#!/usr/bin/env node


module.exports = async ({ github, context, core }) => {
  const fs = require('fs');
  
  let validationOutput = '';
  let imagesOutput = '';
  
  try {
    validationOutput = fs.readFileSync('validation-output.log', 'utf8');
  } catch (e) {
    validationOutput = 'No validation output';
  }
  
  try {
    imagesOutput = fs.readFileSync('images-output.log', 'utf8');
  } catch (e) {
    imagesOutput = 'No image validation output';
  }
  
  const warnings = validationOutput.match(/\[warn\].*$/gm) || [];
  const errors = validationOutput.match(/\[error\].*$/gm) || [];
  const imageErrors = imagesOutput.match(/\[error\].*$/gm) || [];
  
  const allErrors = [...errors, ...imageErrors];
  
  const checkedFolders = process.env.CHECKED_FOLDERS || 'N/A';
  
  let comment = '## 🔍 Validation Results\n\n';
  
  if (allErrors.length === 0 && warnings.length === 0) {
    comment += '✅ **All checks passed!** No issues found.\n';
  } else {
    if (allErrors.length > 0) {
      comment += '### ❌ Errors\n\n';
      allErrors.forEach(err => {
        const cleanErr = err.replace(/\[error\]\s*/, '');
        comment += `- 🔴 ${cleanErr}\n`;
      });
      comment += '\n';
    }
    
    if (warnings.length > 0) {
      comment += '### ⚠️ Warnings\n\n';
      warnings.forEach(warn => {
        const cleanWarn = warn.replace(/\[warn\]\s*/, '');
        comment += `- 🟡 ${cleanWarn}\n`;
      });
      comment += '\n';
    }
  }
  
  comment += '---\n';
  comment += `**Checked folders:** \`${checkedFolders}\``;
  
  const { data: comments } = await github.rest.issues.listComments({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: context.issue.number,
  });
  
  const botComment = comments.find(comment => 
    comment.user.type === 'Bot' && 
    comment.body.includes('🔍 Validation Results')
  );
  
  if (botComment) {
    core.info('Updating existing PR comment');
    await github.rest.issues.updateComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      comment_id: botComment.id,
      body: comment
    });
  } else {
    core.info('Creating new PR comment');
    await github.rest.issues.createComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: context.issue.number,
      body: comment
    });
  }
};
