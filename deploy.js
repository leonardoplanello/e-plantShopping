import { execSync } from 'child_process';
import { existsSync, cpSync, rmSync } from 'fs';
import { join } from 'path';

const distDir = 'dist';
const tempDir = 'gh-pages-temp';

console.log('🚀 Iniciando deploy para GitHub Pages...');

try {
  // Verificar se a pasta dist existe
  if (!existsSync(distDir)) {
    console.error('❌ Erro: Pasta dist não encontrada. Execute npm run build primeiro.');
    process.exit(1);
  }

  // Fazer backup da branch atual
  const currentBranch = execSync('git branch --show-current', { encoding: 'utf-8' }).trim();
  console.log(`📦 Branch atual: ${currentBranch}`);

  // Criar diretório temporário e copiar dist
  if (existsSync(tempDir)) {
    rmSync(tempDir, { recursive: true, force: true });
  }
  cpSync(distDir, tempDir, { recursive: true });

  // Criar ou fazer checkout da branch gh-pages
  try {
    execSync('git checkout gh-pages', { stdio: 'ignore' });
    console.log('✅ Branch gh-pages encontrada');
    // Limpar arquivos antigos
    execSync('git rm -rf .', { stdio: 'ignore' });
  } catch (e) {
    console.log('📝 Criando branch gh-pages...');
    execSync('git checkout --orphan gh-pages', { stdio: 'ignore' });
  }

  // Copiar conteúdo da pasta temp para a raiz
  cpSync(tempDir, '.', { recursive: true });
  rmSync(tempDir, { recursive: true, force: true });

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
    execSync(`git checkout ${currentBranch}`, { stdio: 'ignore' });
  } catch (e) {}
  process.exit(1);
}

