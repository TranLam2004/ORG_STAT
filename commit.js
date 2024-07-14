import simpleGit from 'simple-git';
import path from 'path';
import fs from 'fs';

// Đường dẫn đến repository của bạn
const repoPath = path.resolve();

// Tạo đối tượng git
const git = simpleGit(repoPath);

export async function autoCommitPush() {
    try {
        // Kiểm tra sự tồn tại của thư mục img và tạo nếu không tồn tại
        const imgFolderPath = path.join(repoPath, 'img');
        if (!fs.existsSync(imgFolderPath)) {
            fs.mkdirSync(imgFolderPath, { recursive: true });
            console.log(`Folder 'img' created at path: ${imgFolderPath}`);
        } else {
            console.log(`Folder 'img' already exists at path: ${imgFolderPath}`);
        }
        
        // Thiết lập thông tin người dùng global cho Git
        await git.addConfig('user.name', 'github-actions[bot]');
        await git.addConfig('user.email', 'github-actions[bot]@users.noreply.github.com');
        
        // Thêm tất cả các thay đổi trong thư mục img
        await git.add('img');

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
// autoCommitPush();
