import simpleGit from 'simple-git';
import path from 'path';

// Đường dẫn đến repository của bạn
const repoPath = path.resolve();

// Tạo đối tượng git
const git = simpleGit(repoPath);

export async function autoCommitPush() {
    try {
        // Thêm tất cả các thay đổi
        await git.add('./*');

        // Tạo commit với thông điệp tự động
        await git.commit(`Auto commit`);

        // Push thay đổi lên GitHub
        await git.push('origin', 'main');
        
        console.log('Successfully committed and pushed changes.');
    } catch (err) {
        console.error('Failed to commit and push changes:', err);
    }
}

export default autoCommitPush();
// Gọi hàm autoCommitPush
//autoCommitPush();
