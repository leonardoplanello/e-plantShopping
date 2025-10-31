import { execSync } from 'child_process';
import { existsSync, readdirSync, cpSync, rmSync, statSync } from 'fs';
import { join } from 'path';

const distDir = 'dist';

console.log('🚀 Iniciando deploy para GitHub Pages...');

try {
  // Garantir que estamos na branch main antes de começar
  const currentBranch = execSync('git branch --show-current', { encoding: 'utf-8' }).trim();
  console.log(`📦 Branch atual: ${currentBranch}`);
  
  if (currentBranch !== 'main') {
    console.log(`⚠️ Não está na branch main. Fazendo checkout para main...`);
    execSync('git checkout main', { stdio: 'inherit' });
  }

  // Verificar se a pasta dist existe
  if (!existsSync(distDir)) {
    console.error('❌ Erro: Pasta dist não encontrada. Execute npm run build primeiro.');
    process.exit(1);
  }

  // Criar ou fazer checkout da branch gh-pages
  try {
    // Tentar fazer checkout da branch existente
    execSync('git checkout gh-pages', { stdio: 'ignore' });
    console.log('✅ Branch gh-pages encontrada');
  } catch (e) {
    // Branch não existe, criar nova
    console.log('📝 Criando branch gh-pages...');
    try {
      execSync('git checkout --orphan gh-pages', { stdio: 'ignore' });
    } catch (err) {
      console.log('⚠️ Erro ao criar branch, tentando limpar...');
    }
  }
  
  // Limpar TODOS os arquivos exceto .git (remover node_modules também)
  console.log('🧹 Limpando arquivos antigos...');
  const files = readdirSync('.');
  files.forEach(file => {
    if (file !== '.git') {
      try {
        rmSync(file, { recursive: true, force: true });
      } catch (e) {
        // Ignorar erros de arquivos já removidos
      }
    }
  });
  
  // Limpar staging area do Git
  try {
    execSync('git rm -rf .', { stdio: 'ignore' });
  } catch (e) {
    // Ignorar se não houver nada para remover
  }

  // Copiar apenas o conteúdo da pasta dist para a raiz
  const distFiles = readdirSync(distDir);
  distFiles.forEach(file => {
    const srcPath = join(distDir, file);
    const destPath = file;
    const stat = statSync(srcPath);
    if (stat.isDirectory()) {
      cpSync(srcPath, destPath, { recursive: true });
    } else {
      cpSync(srcPath, destPath);
    }
  });

  // Adicionar todos os arquivos
  execSync('git add -A', { stdio: 'inherit' });

  // Commit
  const commitMessage = `Deploy: ${new Date().toISOString()}`;
  try {
    execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
  } catch (e) {
    console.log('⚠️ Nenhuma mudança para commitar');
  }

  // Push para GitHub
  console.log('📤 Fazendo push para GitHub...');
  execSync('git push origin gh-pages --force', { stdio: 'inherit' });

  // Voltar para a branch main
  execSync(`git checkout ${currentBranch}`, { stdio: 'ignore' });

  console.log('✅ Deploy concluído com sucesso!');
  console.log('🌐 Seu site estará disponível em: https://leonardoplanello.github.io/e-plantShopping/');
} catch (error) {
  console.error('❌ Erro durante o deploy:', error.message);
  // Tentar voltar para a branch original em caso de erro
  try {
    const currentBranch = execSync('git branch --show-current', { encoding: 'utf-8' }).trim();
    if (currentBranch === 'gh-pages') {
      execSync('git checkout main', { stdio: 'ignore' });
    }
  } catch (e) {}
  process.exit(1);
}
