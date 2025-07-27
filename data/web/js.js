// 加载导航数据并渲染页面
document.addEventListener('DOMContentLoaded', function () {
    // 获取页面元素
    const pageTitle = document.getElementById('page-title');
    const navContainer = document.getElementById('nav-container');

    // 加载JSON数据
    fetch('list.json')
        .then(response => response.json())
        .then(data => {
            // 设置页面标题
            pageTitle.textContent = data.title;

            // 设置CSS变量
            document.documentElement.style.setProperty('--bg-color', data.backgroundColor);
            document.documentElement.style.setProperty('--font-color', data.fontColor);

            // 生成导航内容
            data.list.forEach(category => {
                // 创建分类容器
                const categoryDiv = document.createElement('div');
                categoryDiv.className = 'category';

                // 添加分类标题
                const categoryTitle = document.createElement('h2');
                categoryTitle.className = 'category-title';
                categoryTitle.textContent = category.name;
                categoryDiv.appendChild(categoryTitle);

                // 创建链接容器
                const linksContainer = document.createElement('div');
                linksContainer.className = 'links-container';

                // 添加链接项
                category.list.forEach(link => {
                    const linkItem = document.createElement('a');
                    linkItem.className = 'link-item';
                    linkItem.href = link.link;
                    linkItem.setAttribute('target', '_blank');
                    linkItem.setAttribute('rel', 'noopener noreferrer');
                    linkItem.textContent = link.name;
                    linksContainer.appendChild(linkItem);
                });

                categoryDiv.appendChild(linksContainer);
                navContainer.appendChild(categoryDiv);
            });
        })
        .catch(error => {
            console.error('加载导航数据失败:', error);
            pageTitle.textContent = '导航加载失败';
        });
});
