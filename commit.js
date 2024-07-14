import simpleGit from 'simple-git';
import path from 'path';

// Đường dẫn đến repository của bạn
const repoPath = path.resolve();

// Tạo đối tượng git
const git = simpleGit(repoPath);


export async function autoCommitPush() {
    try {
        // Thiết lập thông tin người dùng global cho Git
        await git.addConfig('user.name', 'github-actions[bot]');
        await git.addConfig('user.email', 'github-actions[bot]@users.noreply.github.com');
        // Thêm tất cả các thay đổi
        await git.add('./*');

        // Lấy trạng thái của repo để biết những thay đổi nào đã được staged
        const statusSummary = await git.status();

        // Tạo commit với thông điệp tự động
        await git.commit(`Auto commit`);

        // Push thay đổi lên GitHub
        await git.push('origin', 'main');
        
        // Lấy danh sách các file được commit từ statusSummary
        const committedFiles = statusSummary.staged;
        console.log('Successfully committed and pushed changes.');
        console.log('Committed files:', committedFiles);
    } catch (err) {
        console.error('Failed to commit and push changes:', err);
    }
}

export default autoCommitPush;
// Gọi hàm autoCommitPush
//autoCommitPush();
