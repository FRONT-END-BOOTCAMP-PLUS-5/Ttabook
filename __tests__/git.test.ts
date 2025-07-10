import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

describe('Git branch hygiene', () => {
  it('should be on the refactor branch', async () => {
    const { stdout } = await execAsync('git symbolic-ref --short HEAD');
    const currentBranch = stdout.trim();
    
    expect(currentBranch).toBe('refactor/folder-structure-and-name-change');
  });
});