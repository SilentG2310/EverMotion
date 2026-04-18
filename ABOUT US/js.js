/* EVERMOTION // COMMERCIAL_DYNAMIC_ENGINE
   FEATURES: AMBIENT_PARALLAX, SIDE_DRAWER_DATA_INJECTION, ARCHIVE_ACCORDION
*/

// 1. 团队成员数据
const memberIntel = {
    'gavin': {
        name: 'Gavin Wong Zheng Wen',
        role: 'Group Leader / AI & ML Developer',
        tasks: [
            'Design and implement the hand calibration process (Hand Calibration).',
            'Develop user personalisation and gameplay adaptation logic.',
            'Ensure the system adjusts to different user movement abilities.',
            'Lead overall project coordination and technical strategy.'
        ]
    },
    'zhengxiao': {
        name: 'Li Zheng Xiao',
        role: 'AI & ML Developer',
        tasks: [
            'Implement real-time hand tracking using computer vision (MediaPipe).',
            'Integrate the hand tracking module with the core system framework.',
            'Optimise performance and stability of the tracking system.',
            'Support technical testing and final system evaluation.'
        ]
    },
    'casis': {
        name: 'Casis Channelle Alexis Alejandro',
        role: 'AI & ML Developer',
        tasks: [
            'Develop and implement specific gesture detection logic.',
            'Ensure accurate recognition of complex user hand movements.',
            'Assist in improving interaction accuracy for elderly users.',
            'Lead AI module testing and data validation.'
        ]
    },
    'jiasheng': {
        name: 'Jia Sheng Go',
        role: 'Game Developer',
        tasks: [
            'Design and implement core mini-game mechanics.',
            'Develop internal gameplay logic and interaction flow.',
            'Ensure game feedback is intuitive for motor-impaired users.',
            'Manage game module performance tuning.'
        ]
    },
    'junhui': {
        name: 'Fum Jun Hui',
        role: 'Game Developer & UI/UX',
        tasks: [
            'Design high-level user interface and experience (UI/UX).',
            'Ensure accessibility compliance for elderly and motor-impaired users.',
            'Oversee visual design consistency and navigation flow.',
            'Lead qualitative testing and user feedback analysis.'
        ]
    },
    'joshua': {
        name: 'Joshua Juan Budiman',
        role: 'Game Developer',
        tasks: [
            'Integrate hand tracking system with real-time game components.',
            'Ensure smooth interaction between AI input and gameplay feedback.',
            'Manage cross-platform performance and responsiveness.',
            'Support technical documentation and system architecture.'
        ]
    }
};

// 2. 全局 UI 初始化
document.addEventListener('DOMContentLoaded', () => {
    
    // A. 背景视差效果
    const glowPurple = document.querySelector('.glow-purple');
    const glowGreen = document.querySelector('.glow-green');

    document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;

        if (glowPurple && glowGreen) {
            glowPurple.style.transform = `translate(${mouseX * -70}px, ${mouseY * -70}px)`;
            glowGreen.style.transform = `translate(${mouseX * 70}px, ${mouseY * 70}px)`;
        }
    });

    // B. 滚动显现动画
    const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.vision-card, .game-card, .team-pill, .admin-portal-wrapper').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(40px)';
        el.style.transition = 'opacity 0.8s cubic-bezier(0.19, 1, 0.22, 1), transform 0.8s cubic-bezier(0.19, 1, 0.22, 1)';
        observer.observe(el);
    });
});

// 3. 侧边栏控制
function openTeamDrawer(memberId) {
    const data = memberIntel[memberId];
    if (!data) return;

    document.getElementById('drawer-name').textContent = data.name;
    document.getElementById('drawer-role').textContent = data.role;
    
    const taskList = document.getElementById('drawer-tasks');
    taskList.innerHTML = ''; 
    data.tasks.forEach(task => {
        const li = document.createElement('li');
        li.textContent = task;
        taskList.appendChild(li);
    });

    const drawer = document.getElementById('team-drawer');
    if (drawer) {
        drawer.classList.add('active');
        document.body.style.overflow = 'hidden'; 
    }
}

function closeTeamDrawer() {
    const drawer = document.getElementById('team-drawer');
    if (drawer) {
        drawer.classList.remove('active');
        document.body.style.overflow = ''; 
    }
}

// 4. 游戏模块折叠逻辑
function toggleGameModule(moduleId) {
    const targetCard = document.getElementById(moduleId + '-module');
    if (targetCard) {
        targetCard.classList.toggle('expanded');
        
        // 更新按钮文本
        const btn = targetCard.querySelector('.expand-btn');
        if (btn) {
            const isExpanded = targetCard.classList.contains('expanded');
            btn.textContent = isExpanded ? 'Collapse Resources ↑' : 'Explore Resources ↓';
        }
    }
}

// 5. 存档页折叠逻辑
function toggleModule(moduleId) {
    const targetModule = document.getElementById(moduleId + '-module');
    if (targetModule) {
        targetModule.classList.toggle('expanded');
    }
}