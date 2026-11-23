# Wavelength · 波长出题器

纯前端中文题库，内置 1,000 道光谱题。每轮抽取两道题，支持分类筛选、收藏和本机进度保存。

## 本地打开与编辑

用浏览器打开 `index.html` 即可离线使用，无需安装依赖或构建。

| 文件 | 编辑内容 |
| --- | --- |
| `index.html` | 页面结构、文案和玩法说明 |
| `assets/styles.css` | 配色、布局和响应式样式 |
| `assets/app.js` | 抽题、筛选、收藏、进度和快捷键 |
| `assets/questions.js` | 题库，每行一道题。新增题目时使用唯一的 `id` |

## 免费发布到 GitHub Pages

1. 在 GitHub 新建一个空的公开仓库，例如 `wavelength-hint`。
2. 在项目目录运行以下命令，把 `YOUR_USERNAME` 换成你的 GitHub 用户名。

   ```sh
   git init -b main
   git add .gitignore .nojekyll README.md index.html assets/
   git commit -m "Add Wavelength static site"
   git remote add origin https://github.com/YOUR_USERNAME/wavelength-hint.git
   git push -u origin main
   ```

3. 到仓库的 **Settings → Pages**，选择 **Deploy from a branch**，将发布源设为 `main` 和 `/(root)`，点击 **Save**。
4. 部署完成后，从同一页面打开站点。按示例创建的网址为 `https://YOUR_USERNAME.github.io/wavelength-hint/`。

[GitHub Pages 官方配置步骤](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
