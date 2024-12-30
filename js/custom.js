let log = console.log;
gsap.registerPlugin(ScrollTrigger);

/* @ Element Animation */
function AnimationSet(opt) {
    const { state, type, target } = opt;

    if (!state) return;

    const elements = document.querySelectorAll(`[data-${target}-type]`);

    function isElementInViewport(elm) {
        const elementTop = elm.offsetTop;
        const scrollTop = window.scrollY;
        return scrollTop > elementTop - (window.innerHeight * 0.6);
    }

    function setElementStyles(elm, motion, duration, delay, transform) {
        elm.style.transition = `transform ${duration}s, opacity ${duration}s`;
        elm.style.transitionDelay = `${delay}s`;
        elm.style.transform = transform;
        elm.style.opacity = 0;
    }

    function handleTextPiece(elm) {
        const spans = elm.querySelectorAll('.r-t');
        spans.forEach((span, index) => {
            span.style.transitionDelay = `${index * 0.1}s`;
        });
    }

    function handleOverlayText(elm, duration, delay) {
        const overText = elm.dataset.actionText;
        const overSkew = elm.dataset.actionSkew ? 'skew' : '';
        elm.innerHTML = `
            <p>${overText}
                <span class="cover ${overSkew}" style="
                    animation-duration: ${duration}s;
                    animation-delay: ${delay}s;
                    animation-fill-mode: forwards;
                ">
                    ${overText}
                </span>
            </p>
        `;

        elm.querySelectorAll('.cover span').forEach(span => {
            span.classList.add('cursor-hover');
        });
    }

    function settingAnimation() {
        elements.forEach((elm) => {
            const motion = elm.dataset.actionType;
            const duration = elm.dataset.actionDuration || '0.6';
            const delay = elm.dataset.actionDelay || '0';
            let transform;

            switch (motion) {
                case 'slide-left':
                    transform = 'translate(-80px, 0)';
                    break;
                case 'slide-right':
                    transform = 'translate(80px, 0)';
                    break;
                case 'slide-up':
                    transform = 'translate(0, -80px)';
                    break;
                case 'slide-down':
                    transform = 'translate(0, 80px)';
                    break;
                case 'text-piece':
                    handleTextPiece(elm);
                    return;
                case 'overlay-txt':
                    handleOverlayText(elm, duration, delay);
                    return;
                default:
                    elm.style.display = 'none';
                    return;
            }

            if (motion !== 'overlay-txt' && motion !== 'text-piece') {
                setElementStyles(elm, motion, duration, delay, transform);
            }
        });
    }

    function toggleClass(element, className, condition) {
        if (element) {
            condition ? element.classList.add(className) : element.classList.remove(className);
        }
    }

    function onScroll() {
        const header = document.querySelector('header');
        header.classList.toggle('fixed', window.scrollY > 0);

        elements.forEach((elm) => {
            const motion = elm.dataset.actionType;
            const isInViewport = isElementInViewport(elm);
            const overlayElement = elm.closest('.overlay-total') || elm.querySelector('.cover');

            if (motion === 'overlay-txt') {
                toggleClass(overlayElement, 'overlay', isInViewport);
            } else {
                toggleClass(elm, 'active', isInViewport);

                const nestedOverlay = elm.querySelector('.overlay-total');
                if (nestedOverlay) {
                    toggleClass(nestedOverlay, 'overlay', isInViewport);
                }
            }
        });
    }

    if (type === 'base') {
        window.addEventListener('scroll', onScroll);
    }

    settingAnimation();
    onScroll();
}

/* @ Effect Show Animation */
function SnowMaker(opt) {
    const { state, target } = opt;

    if (!state) return;

    const elm = document.querySelector(target);
    const duration = elm.dataset.snowDuration;
    const color = elm.dataset.snowColor;
    const min = parseInt(elm.dataset.snowMin, 10);
    const max = parseInt(elm.dataset.snowMax, 10);
    const length = parseInt(elm.dataset.snowLength, 10);

    const generateShadow = (min, max, color) => {
        const x = getRandomInt(min, max);
        const y = getRandomInt(min, max);
        return `${x}px ${y}px var(${color})`;
    };

    const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    const shadows = Array.from({ length }, () => generateShadow(min, max, color)).join(", ");

    elm.style.animationDuration = `${duration}s`;
    elm.style.boxShadow = shadows;
}

/* @ Cursor Animation */
function cursorMoving() {
    const cursor = document.querySelector("#cursor");
    const hoverElements = document.querySelectorAll('.cursor-hover');
    const mouse = { x: -100, y: -100 };
    let isMoving = false;

    const initCursor = () => gsap.set(cursor, { xPercent: -50, yPercent: -50 });
    const updateMousePosition = (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        isMoving = true;
    };

    const animateCursor = () => {
        if (isMoving) {
            gsap.to(cursor, {
                duration: 0.5,
                x: mouse.x,
                y: mouse.y,
                ease: "power2.out",
            });
        }
        requestAnimationFrame(animateCursor);
    };

    const toggleCursorClass = (add) => () => cursor.classList.toggle('change', add);
    const addEventListeners = () => {
        window.addEventListener("mousemove", updateMousePosition);
        window.addEventListener("mousedown", () => isMoving = false);
        window.addEventListener("mouseup", updateMousePosition);

        hoverElements.forEach((element) => {
            element.addEventListener('mouseenter', toggleCursorClass(true));
            element.addEventListener('mouseleave', toggleCursorClass(false));
        });
    };

    // 초기화 및 실행
    const init = () => {
        initCursor();
        addEventListeners();
        animateCursor();
    };

    init();
}

/* @ Smooth Scroll */
function littleScroll({ state, target, speed, smooth }) {
    if (!state) return;

    const scrollTarget = target === document ? document.scrollingElement || document.documentElement || document.body : target;

    let moving = false;
    let pos = scrollTarget.scrollTop;
    const frame = scrollTarget === document.body ? document.documentElement : scrollTarget;

    ['mousewheel', 'DOMMouseScroll'].forEach(evt =>
        scrollTarget.addEventListener(evt, handleScroll, { passive: false })
    );

    document.querySelectorAll('[data-move-scope]').forEach(elm =>
        elm.addEventListener('click', handleMenuClick)
    );

    function handleMenuClick(e) {
        e.preventDefault();
        const targetScope = parseInt(this.dataset.moveScope, 10);
        scrollToElement(`[data-scope-section="${targetScope}"]`);

        document.querySelectorAll('[data-move-scope]').forEach(el => el.classList.remove('active'));
        this.classList.add('active');
        document.querySelector('.nav-btn').click();
    }

    function handleScroll(e) {
        e.preventDefault();
        pos += -normalizeWheelDelta(e) * speed;

        const maxScroll = scrollTarget.scrollHeight - frame.clientHeight;
        const threshold = 10;

        if (pos < threshold || pos > maxScroll - threshold) {
            pos = Math.max(0, Math.min(pos, maxScroll));
            scrollTarget.scrollTop = pos;
        } else if (!moving) {
            updateScroll();
        }

        updateMenuActiveClass();
    }

    function updateMenuActiveClass() {
        let activeSection = null;

        document.querySelectorAll('[data-scope-section]').forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= 0 && rect.bottom > 0) {
                activeSection = section.getAttribute('data-scope-section');
            }
        });

        if (activeSection) {
            document.querySelectorAll('[data-move-scope]').forEach(el => el.classList.remove('active'));

            const activeMenu = document.querySelector(`[data-move-scope="${activeSection}"]`);
            if (activeMenu) {
                activeMenu.classList.add('active');
            }
        }
    }

    function scrollToElement(selector) {
        const targetElement = document.querySelector(selector);
        if (targetElement) {
            pos = targetElement.offsetTop;
            if (!moving) updateScroll();
        }
    }

    function normalizeWheelDelta(e) {
        return e.wheelDelta ? e.wheelDelta / 120 : -e.detail / 3;
    }

    function updateScroll() {
        moving = true;
        const delta = (pos - scrollTarget.scrollTop) / smooth;
        scrollTarget.scrollTop += delta;

        if (Math.abs(delta) > 0.5 && scrollTarget.scrollTop < scrollTarget.scrollHeight - frame.clientHeight && scrollTarget.scrollTop > 0) {
            requestFrame(updateScroll);
        } else {
            moving = false;
        }
    }

    // requestAnimationFrame 핸들링
    const requestFrame = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        (func => window.setTimeout(func, 1000 / 50));

    // 초기화 후 스크롤 이벤트에 따라 메뉴 상태 업데이트
    updateMenuActiveClass();
}

function projectPopup() {
    let name;
    const projectImages = {
        whistle: [
            './images/port/img_pt_whistle.png',
            './images/port/img_pt_whistle01.png',
            './images/port/img_pt_whistle02.png',
            './images/port/img_pt_whistle03.png',
            './images/port/img_pt_whistle04.png',
            './images/port/img_pt_whistle05.png',
            './images/port/img_pt_whistle06.png',
            './images/port/img_pt_whistle07.png'
        ],
        autoplus: [
            './images/port/img_pt_auto.png',
            './images/port/img_pt_auto01.png',
            './images/port/img_pt_auto02.png',
            './images/port/img_pt_auto03.png',
            './images/port/img_pt_auto04.png',
            './images/port/img_pt_auto05.png'
        ],
        company: [
            './images/port/img_pt_auto_esg.png',
            './images/port/img_pt_auto_esg02.png',
            // './images/port/img_pt_auto_esg03.png',
            './images/port/img_pt_auto_esg04.png',
            // './images/port/img_pt_auto_esg05.png',
            './images/port/img_pt_auto_esg06.png',
            './images/port/img_pt_auto_esg07.png'
        ]
    };

    document.querySelectorAll('.work-frame .thumbnail').forEach(thumbnail => {
        thumbnail.addEventListener('click', function() {
            const project = this.getAttribute('data-project');
            const popup = document.querySelector('.project-popup');
            const imgList = popup.querySelector('.img-list');

            imgList.innerHTML = '';
            if (projectImages[project]) {
                projectImages[project].forEach(src => {
                    const imgItem = document.createElement('div');
                    imgItem.classList.add('item', 'cursor-hover');
                    imgItem.innerHTML = `<img src="${src}">`;
                    imgList.appendChild(imgItem);
                });
            }

            document.body.classList.add('scroll-none');
            popup.classList.add('active');
            popup.classList.add(project);
            name = project;
        });
    });

    document.querySelector('.project-close').addEventListener('click', function() {
        const popup = document.querySelector('.project-popup');

        document.body.classList.remove('scroll-none');
        popup.classList.remove('active');
        popup.classList.remove(name);

        name = '';
    });
}

document.addEventListener('DOMContentLoaded', () => {    
    // 스크롤효과 생성
    const WindowShortScroll = new littleScroll({
		state : true,
		target : document,
		speed : 200,
		smooth : 60
	});

    // 애니메이션 생성
    const animation = new AnimationSet({
        state: true,
        type: 'base',
        target: 'action'
    });

    // 별빛 효과 생성
    const star01 = new SnowMaker({
        state: true,
        target: '.star-small'
    });
    const star02 = new SnowMaker({
        state: true,
        target: '.star-medium'
    });
    const star03 = new SnowMaker({
        state: true,
        target: '.star-large'
    });

    gsap.to("[data-speed]", {
        y: (i, el) => (1 - parseFloat(el.getAttribute("data-speed"))) * ScrollTrigger.maxScroll(window),
        ease: "none",
        scrollTrigger: {
            start: 0,
            end: "max",
            invalidateOnRefresh: true,
            scrub: 0
        }
    });

    // 커서 효과
    cursorMoving();
    // 프로젝트 간략 보기 팝업
    // projectPopup();
});
