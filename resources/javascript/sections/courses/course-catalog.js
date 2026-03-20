// Course Catalog Manager - High maintainability for course and exercise catalogs
document.addEventListener('DOMContentLoaded', () => {
    // Course data structure - Easy to maintain and extend
    const courseData = {
        teaching: {
            title: "教学课程",
            courses: [
                {
                    id: "rmb-currency-recognition",
                    name: "认识人民币",
                    icon: "../../../assets/images/rmbs/elements/portraits/yuan-100.jpg",
                    description: "学习人民币的面值、图案等信息",
                    difficulties: [
                        {
                            level: "easy",
                            name: "认识纸币",
                            description: "通过颜色与元素认识人民币的不同面值",
                            url: "rmb-easy-template.html"
                        },
                        {
                            level: "medium",
                            name: "认识硬币",
                            description: "认识不同的硬币面值和特点",
                            url: "rmb-medium-template.html"
                        }
                    ]
                },
                {
                    id: "cash-payment",
                    name: "现金支付",
                    icon: "../../../assets/images/sundry/cash-payment.png",
                    description: "学习如何使用现金支付",
                    difficulties: [
                        {
                            level: "medium",
                            name: "现金支付",
                            description: "学习如何使用现金进行购物支付",
                            url: "cash-payment-template.html"
                        }
                    ]
                },
                {
                    id: "online-payment",
                    name: "电子支付",
                    icon: "../../../assets/images/sundry/online-payment.png",
                    description: "学习如何使用电子支付",
                    difficulties: [
                        {
                            level: "easy",
                            name: "电子支付",
                            description: "学习了解电子支付的流程",
                            url: "online-payment-template.html"
                        }
                    ]
                }
            ]
        },
        exercises: {
            title: "练习课程",
            courses: [
                {
                    id: "money-exchange",
                    name: "兑钱练习",
                    icon: "../../../assets/images/rmbs/elements/portraits/yuan-100.jpg",
                    description: "练习人民币间的等额兑换",
                    difficulties: [
                        {
                            level: "easy",
                            name: "纸币兑换",
                            description: "练习1元至100元纸币的货币兑换",
                            url: "money-practice-template.html?level=easy"
                        },
                        {
                            level: "medium",
                            name: "综合兑换",
                            description: "练习1角至1元硬币及1元至100元纸币的货币兑换",
                            url: "money-practice-template.html?level=medium"
                        }
                    ]
                },
                {
                    id: "shopping-challenge",
                    name: "购物模拟",
                    icon: "../../../assets/images/study-tools/pencil.jpg",
                    description: "综合购物技能的挑战练习",
                    difficulties: [
                        {
                            level: "easy",
                            name: "购物模拟（一）",
                            description: "简易的商品价格计算，支付足够金额以完成交易"
                        },
                        {
                            level: "medium",
                            name: "购物模拟（二）",
                            description: "简易的商品价格计算，支付精准金额以完成交易"
                        },
                        {
                            level: "hard",
                            name: "购物挑战（一）",
                            description: "复杂的商品价格计算，支付精准金额以完成交易"
                        },
                        {
                            level: "expert",
                            name: "购物挑战（二）",
                            description: "更复杂的商品价格计算，在满足消费金额限制的情况下完成交易"
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

            difficultyElement.addEventListener('click', (event) => handleDifficultyClick(course, difficulty, event));
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
    function handleDifficultyClick(course, difficulty, event) {
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
            // alert(`开始课程：${course.name}\n难度：${difficulty.name}\n\n${difficulty.description}`);
            alert(`课程正在开发中，敬请期待！\n\n课程：${course.name}\n难度：${difficulty.name}`);
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
