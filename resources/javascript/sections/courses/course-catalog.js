// Course Catalog Manager - High maintainability for course and exercise catalogs
document.addEventListener('DOMContentLoaded', () => {
    // Course data structure - Easy to maintain and extend
    const courseData = {
        teaching: {
            title: "教学课程",
            courses: [
                {
                    id: "money-recognition",
                    name: "认识人民币",
                    icon: "../../../assets/images/rmbs/elements/portraits/yuan-100.jpg",
                    description: "学习人民币的面值、图案等信息",
                    difficulties: [
                        {
                            level: "easy",
                            name: "基础认识",
                            description: "通过颜色认识人民币的不同面值",
                            url: "rmb-easy-template.html"
                        },
                        {
                            level: "medium",
                            name: "进阶辨识",
                            description: "通过各个组成部分认识人民币的不同面值"
                        },
                        {
                            level: "medium",
                            name: "认识硬币",
                            description: "认识不同的硬币面值和特点"
                        }
                    ]
                },
                {
                    id: "payment-methods",
                    name: "支付方式",
                    icon: "../../../assets/images/sundry/cash-payment.png",
                    description: "了解现金支付和电子支付的不同方式",
                    difficulties: [
                        {
                            level: "easy",
                            name: "现金支付",
                            description: "学习如何使用现金进行购物支付"
                        },
                        {
                            level: "medium",
                            name: "电子支付",
                            description: "了解手机支付和银行卡支付的基本操作"
                        }
                    ]
                },
                {
                    id: "shopping-skills",
                    name: "购物技巧",
                    icon: "../../../assets/images/study-tools/notebook.jpg",
                    description: "掌握挑选商品、比较价格的购物技能",
                    difficulties: [
                        {
                            level: "easy",
                            name: "商品挑选",
                            description: "学习如何根据需求挑选合适的商品"
                        },
                        {
                            level: "medium",
                            name: "价格比较",
                            description: "掌握比较不同商品价格和性价比的方法"
                        },
                        {
                            level: "hard",
                            name: "预算规划",
                            description: "学习制定购物预算和控制消费"
                        }
                    ]
                }
            ]
        },
        exercises: {
            title: "练习课程",
            courses: [
                {
                    id: "money-practice",
                    name: "人民币练习",
                    icon: "../../../assets/images/rmbs/elements/portraits/yuan-100.jpg",
                    description: "通过游戏练习人民币的识别和计算",
                    difficulties: [
                        {
                            level: "easy",
                            name: "简单计算",
                            description: "练习1-10元人民币的加减运算"
                        },
                        {
                            level: "medium",
                            name: "找零练习",
                            description: "学习购物找零和金额计算"
                        },
                        {
                            level: "hard",
                            name: "综合应用",
                            description: "综合运用人民币知识解决实际问题"
                        },
                        {
                            level: "expert",
                            name: "挑战模式",
                            description: "高难度人民币计算和应用挑战"
                        }
                    ]
                },
                {
                    id: "payment-exercise",
                    name: "支付练习",
                    icon: "../../../assets/images/sundry/online-payment.png",
                    description: "模拟真实购物场景进行支付练习",
                    difficulties: [
                        {
                            level: "easy",
                            name: "模拟购物",
                            description: "在虚拟商店中练习支付流程"
                        },
                        {
                            level: "medium",
                            name: "支付选择",
                            description: "根据不同情况选择合适的支付方式"
                        },
                        {
                            level: "hard",
                            name: "问题解决",
                            description: "处理支付过程中的各种问题和异常情况"
                        }
                    ]
                },
                {
                    id: "shopping-challenge",
                    name: "购物挑战",
                    icon: "../../../assets/images/study-tools/pencil.jpg",
                    description: "综合购物技能的挑战练习",
                    difficulties: [
                        {
                            level: "medium",
                            name: "预算挑战",
                            description: "在限定预算内完成购物任务"
                        },
                        {
                            level: "hard",
                            name: "时间挑战",
                            description: "在时间限制内完成购物规划"
                        },
                        {
                            level: "expert",
                            name: "综合挑战",
                            description: "综合运用所有购物技能的终极挑战"
                        }
                    ]
                }
            ]
        }
    };

    // Get current page type (teaching or exercises)
    const currentPage = window.location.pathname.includes('teaching') ? 'teaching' : 'exercises';
    const data = courseData[currentPage];

    // DOM elements
    const courseSidebar = document.querySelector('.course-sidebar');
    const difficultyContent = document.querySelector('.difficulty-content');
    const descriptionContainer = document.querySelector('.difficulty-description-container');
    const descriptionText = document.getElementById('selected-difficulty-description');
    const startBtn = document.getElementById('start-course-btn');

    let selectedCourse = null;
    let selectedDifficulty = null;
    // Initialize
    function init() {
        renderCourseList();
        selectCourse(data.courses[0]); // Select first course by default
    }

    // Render course list
    function renderCourseList() {
        courseSidebar.innerHTML = '';

        data.courses.forEach(course => {
            const courseElement = document.createElement('div');
            courseElement.className = `course-item ${course.id === (selectedCourse?.id || '') ? 'selected' : ''}`;
            courseElement.dataset.courseId = course.id;

            courseElement.innerHTML = `
                <img src="${course.icon}" alt="${course.name}" class="course-icon">
                <h3 class="course-name">${course.name}</h3>
                <p class="course-description">${course.description}</p>
            `;

            courseElement.addEventListener('click', () => selectCourse(course));
            courseSidebar.appendChild(courseElement);
        });
    }

    // Select course
    function selectCourse(course) {
        selectedCourse = course;

        // Update UI selection
        document.querySelectorAll('.course-item').forEach(item => {
            item.classList.remove('selected');
            if (item.dataset.courseId === course.id) {
                item.classList.add('selected');
            }
        });

        // Render difficulty levels
        renderDifficultyLevels(course);

        // Update course info
        updateCourseInfo(course);
    }

    // Render difficulty levels
    function renderDifficultyLevels(course) {
        const difficultyGrid = difficultyContent.querySelector('.difficulty-grid') ||
                              difficultyContent.insertBefore(document.createElement('div'), difficultyContent.firstChild);

        difficultyGrid.className = 'difficulty-grid';
        difficultyGrid.innerHTML = '';

        course.difficulties.forEach(difficulty => {
            const difficultyElement = document.createElement('div');
            difficultyElement.className = `difficulty-card difficulty-${difficulty.level}`;

            difficultyElement.innerHTML = `
                <div class="difficulty-level">${getDifficultyLevelText(difficulty.level)}</div>
                <h4 class="difficulty-name">${difficulty.name}</h4>
            `;

            difficultyElement.addEventListener('click', () => handleDifficultyClick(course, difficulty));
            difficultyGrid.appendChild(difficultyElement);
        });

        // Clear selected difficulty
        selectedDifficulty = null;
        if (descriptionContainer) {
            descriptionContainer.style.display = 'none';
        }
    }

    // Update course info - REMOVED as no longer needed

    // Handle difficulty click - now shows difficulty description
    function handleDifficultyClick(course, difficulty) {
        selectedDifficulty = difficulty;

        // Update difficulty cards selection
        document.querySelectorAll('.difficulty-card').forEach(card => {
            card.classList.remove('selected');
        });
        event.currentTarget.classList.add('selected');

        // Show description container
        if (descriptionContainer && descriptionText && startBtn) {
            descriptionText.textContent = difficulty.description;
            startBtn.textContent = `【开始】${course.name} - ${difficulty.name}`;
            startBtn.onclick = () => startCourse(course, difficulty);
            descriptionContainer.style.display = 'flex';
        }
    }

    // Start course - when user clicks the start button
    function startCourse(course, difficulty) {
        if (difficulty.url) {
            window.location.href = difficulty.url;
        } else {
            // TODO: Navigate to actual course content page
            // For now, show confirmation
            alert(`开始课程：${course.name}\n难度：${difficulty.name}\n\n${difficulty.description}`);
            // window.location.href = `course-content.html?course=${course.id}&difficulty=${difficulty.level}`;
        }
    }

    // Get difficulty level text
    function getDifficultyLevelText(level) {
        const levels = {
            'easy': '★',
            'medium': '★★',
            'hard': '★★★',
            'expert': '★★★★'
        };
        return levels[level] || level;
    }

    // Initialize the catalog
    init();

    // Expose functions for external use (for future integration)
    window.courseCatalog = {
        selectCourse,
        getCurrentCourse: () => selectedCourse,
        getCourseData: () => data
    };
});
