// ==UserScript==
// @name         Nyaa - Highlight & Block
// @version      1.10
// @description  Highlight and block releases on nyaa.si
// @author       Animorphs
// @namespace    https://github.com/Animorphs/Nyaa-Highlight-and-Block
// @icon         https://nyaa.si/static/favicon.png
// @match        https://nyaa.si/
// @match        https://nyaa.si/?*
// @match        https://nyaa.si/user/*
// @match        https://sukebei.nyaa.si/
// @match        https://sukebei.nyaa.si/?*
// @match        https://sukebei.nyaa.si/user/*
// @exclude      https://nyaa.si/?page=rss*
// @exclude      https://sukebei.nyaa.si/?page=rss*
// @grant        GM_setValue
// @grant        GM_getValue
// @updateURL    https://raw.githubusercontent.com/Animorphs/Nyaa-Highlight-and-Block/master/Nyaa-Highlight-and-Block.user.js
// @downloadURL  https://raw.githubusercontent.com/Animorphs/Nyaa-Highlight-and-Block/master/Nyaa-Highlight-and-Block.user.js
// ==/UserScript==

(function() {
    'use strict';

    // ============================================================================
    // CONSTANTS & CONFIGURATION
    // ============================================================================

    const isSukebei = window.location.hostname === 'sukebei.nyaa.si';
    const CONFIG = {
        STORAGE_KEYS: {
            HIGHLIGHT: isSukebei ? 'keywordsHighlight_sukebei' : 'keywordsHighlight',
            BLOCK: isSukebei ? 'keywordsBlock_sukebei' : 'keywordsBlock',
            FANSUBBERS_TOGGLE: 'fansubbersToggle',
            MINIS_TOGGLE: 'minisToggle',
            FANSUBBERS_BLACKLIST: 'fansubbersBlacklist',
            MINIS_BLACKLIST: 'minisBlacklist',
            BLOCKED_CATEGORIES: isSukebei ? 'blockedCategories_sukebei' : 'blockedCategories',
            SHOW_AUTO_RULES: 'showAutoRules',
            SHOW_MANUAL_RULES: 'showManualRules'
        },
        DEFAULTS: {
            HIGHLIGHT: isSukebei ? [
                [["[SakuraCircle]"], []]
            ] : [
                [["[Animorphs]"], []],
                [["[whomst]"], []]
            ],
            BLOCK: isSukebei ? [] : [
                [["[Raze]"], []],
                [["[SubsPlease]"], ["1080p"]],
                [["[Erai-raws]"], ["1080p"]]
            ]
        },
        DEBOUNCE_DELAY: 100,
        MAX_HEIGHT_VH: 90
    };

    const PRESETS = {
        FANSUBBERS: [
            [["[9volt]"], []],
            [["[Animorphs]"], []],
            [["[Arid]"], []],
            [["[Asakura]"], []],
            [["[Baws]"], []],
            [["[Blasphemboys]"], []],
            [["[BlurayDesuYo]"], []],
            [["[Cait-Sidhe]"], []],
            [["[cappybara]"], []],
            [["[chasa]"], []],
            [["[Chihiro]"], []],
            [["[Commie]"], []],
            [["[Cyan]"], []],
            [["[DameDesuYo]"], []],
            [["[DarkWispers]"], []],
            [["[derpie]"], []],
            [["[FLE]"], []],
            [["[Foxtrot]"], []],
            [["[Freehold]"], []],
            [["[GHS]"], []],
            [["[Glue]"], []],
            [["[GJM]"], []],
            [["[h-b]"], []],
            [["[Half-Baked]"], []],
            [["[Heartside]"], []],
            [["[Inka-Subs]"], []],
            [["[Kaleido-subs]"], []],
            [["[Kaizoku]"], []],
            [["[Lazyleido]"], []],
            [["[LonelyChaser]"], []],
            [["[MaruChanSubs]"], []],
            [["[McBalls]"], []],
            [["[Mocha]"], []],
            [["[mSubs]"], []],
            [["[MTBB]"], []],
            [["[Noiy]"], []],
            [["[Ny]"], []],
            [["[Okay-Subs]"], []],
            [["[Orphan]"], []],
            [["[P9]"], []],
            [["[Paradise]"], []],
            [["[Perevodildo]"], []],
            [["[Piyoko]"], []],
            [["[Pizza]"], []],
            [["[poop]"], []],
            [["[Reza]"], []],
            [["[Saizen]"], []],
            [["[sam]"], []],
            [["[Seigyoku]"], []],
            [["(shiteater)"], []],
            [["[Some-Stuffs]"], ["Pocket Monsters", "Poké"]], // Exclude pokemon due to volume that probably isn't relevant to most
            [["[sgt]"], []],
            [["[Starbez]"], []],
            [["[Stardust]"], []],
            [["[tracen]"], []],
            [["[Vodes]"], []],
            [["[WakuTomete]"], []],
            [["[WastedChaser]"], []],
            [["[WasteOfBlindness]"], []],
            [["[washed]"], []],
            [["[whomst]"], []]
        ],
        MINIS: [
            [["[Anime Time]"], []],
            [["[ARR]"], []],
            [["[ASW]"], []],
            [["AV1"], []],
            [["[Feibanyama]"], []],
            [["[GERmini]"], []],
            [["[Judas]"], []],
            [["[DB]"], []],
            [["[DKB]"], []],
            [["[EMBER]"], []],
            [["[Erai-raws]", "WEBRip"], []],
            [["[JacobSwaggedUp]"], []],
            [["[MiniMTBB]"], []],
            [["[neoDESU]"], []],
            [["[neoHEVC]"], []],
            [["Rapta"], []],
            [["[Tenrai-Sensei]"], []],
            [["[TRC]"], []]
        ]
    };

    const CATEGORIES = isSukebei ? {
        'art-anime': 'Art - Anime',
        'art-doujinshi': 'Art - Doujinshi',
        'art-games': 'Art - Games',
        'art-manga': 'Art - Manga',
        'art-pictures': 'Art - Pictures',
        'real-life-photobooks': 'Real Life - Photobooks and Pictures',
        'real-life-videos': 'Real Life - Videos'
    } : {
        'anime-amv': 'Anime - AMV',
        'anime-english': 'Anime - English-translated',
        'anime-non-english': 'Anime - Non-English-translated',
        'anime-raw': 'Anime - Raw',
        'audio-lossless': 'Audio - Lossless',
        'audio-lossy': 'Audio - Lossy',
        'literature-english': 'Literature - English-translated',
        'literature-non-english': 'Literature - Non-English-translated',
        'literature-raw': 'Literature - Raw',
        'live-action-english': 'Live Action - English-translated',
        'live-action-idol': 'Live Action - Idol/Promotional Video',
        'live-action-non-english': 'Live Action - Non-English-translated',
        'live-action-raw': 'Live Action - Raw',
        'pictures-graphics': 'Pictures - Graphics',
        'pictures-photos': 'Pictures - Photos',
        'software-applications': 'Software - Applications',
        'software-games': 'Software - Games'
    };

    const SELECTORS = {
        TORRENT_ROWS: 'tbody tr',
        TITLE_ELEMENT: 'td[colspan="2"] a',
        GUI_CONTAINER: 'guiContainer'
    };

    // ============================================================================
    // FUNCTIONAL UTILITIES
    // ============================================================================

    /**
     * Functional utility for chaining operations like "chips"
     * Provides a fluent interface for combining predicates
     */
    const Chips = {
        from: (value) => new ChipChain(value),
        all: (predicates) => (value) => predicates.every(pred => pred(value)),
        any: (predicates) => (value) => predicates.some(pred => pred(value)),
        contains: (keyword) => (text) => text.toLowerCase().includes(keyword.toLowerCase()),
        not: (predicate) => (value) => !predicate(value)
    };

    /**
     * Chain class for fluent predicate composition
     */
    class ChipChain {
        constructor(value) {
            this.value = value;
            this.operations = [];
        }

        and(operation) {
            this.operations.push({ type: 'and', op: operation });
            return this;
        }

        or(operation) {
            this.operations.push({ type: 'or', op: operation });
            return this;
        }

        not(operation) {
            this.operations.push({ type: 'not', op: operation });
            return this;
        }

        execute() {
            if (this.operations.length === 0) return this.value;

            return this.operations.reduce((result, { type, op }) => {
                switch (type) {
                    case 'and':
                        return result && op(this.value);
                    case 'or':
                        return result || op(this.value);
                    case 'not':
                        return result && !op(this.value);
                    default:
                        return result;
                }
            }, true);
        }

        result() {
            return this.execute();
        }
    }

    // ============================================================================
    // UTILITY FUNCTIONS
    // ============================================================================

    /**
     * Debounce function to limit rapid successive calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    const debounce = (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    /**
     * Sanitize input text by trimming and removing dangerous characters
     * @param {string} text - Text to sanitize
     * @returns {string} Sanitized text
     */
    const sanitizeInput = (text) => {
        if (typeof text !== 'string') return '';
        return text.trim().replace(/[<>]/g, '');
    };

    /**
     * Check if two arrays are deeply equal
     * @param {Array} arr1 - First array
     * @param {Array} arr2 - Second array
     * @returns {boolean} True if arrays are equal
     */
    const arraysEqual = (arr1, arr2) => {
        return JSON.stringify(arr1) === JSON.stringify(arr2);
    };

    // ============================================================================
    // AUTO-IMPORT FUNCTIONALITY
    // ============================================================================

    /**
     * Auto-import fansubbers if toggle is enabled
     */
    const autoImportFansubbers = () => {
        if (!AppState.fansubbersToggle) return;

        let addedCount = 0;
        PRESETS.FANSUBBERS.forEach(newRule => {
            // Check if rule already exists
            const isDuplicate = AppState.keywordsHighlight.some(existingRule =>
                arraysEqual(existingRule[0], newRule[0]) &&
                arraysEqual(existingRule[1], newRule[1])
            );

            // Check if rule is blacklisted
            const isBlacklisted = AppState.fansubbersBlacklist.some(blacklistedRule =>
                arraysEqual(blacklistedRule[0], newRule[0]) &&
                arraysEqual(blacklistedRule[1], newRule[1])
            );

            if (!isDuplicate && !isBlacklisted) {
                AppState.keywordsHighlight.push([...newRule]);
                addedCount++;
            }
        });

        if (addedCount > 0) {
            sortRules(AppState.keywordsHighlight);
            AppState.saveHighlightKeywords();
        }

        return addedCount;
    };

    /**
     * Auto-import minis if toggle is enabled
     */
    const autoImportMinis = () => {
        if (!AppState.minisToggle) return;

        let addedCount = 0;
        PRESETS.MINIS.forEach(newRule => {
            // Check if rule already exists
            const isDuplicate = AppState.keywordsBlock.some(existingRule =>
                arraysEqual(existingRule[0], newRule[0]) &&
                arraysEqual(existingRule[1], newRule[1])
            );

            // Check if rule is blacklisted
            const isBlacklisted = AppState.minisBlacklist.some(blacklistedRule =>
                arraysEqual(blacklistedRule[0], newRule[0]) &&
                arraysEqual(blacklistedRule[1], newRule[1])
            );

            if (!isDuplicate && !isBlacklisted) {
                AppState.keywordsBlock.push([...newRule]);
                addedCount++;
            }
        });

        if (addedCount > 0) {
            sortRules(AppState.keywordsBlock);
            AppState.saveBlockKeywords();
        }

        return addedCount;
    };


    // ============================================================================
    // STATE MANAGEMENT
    // ============================================================================

    /**
     * Application state manager
     */
    const AppState = {
        keywordsHighlight: JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.HIGHLIGHT)) || CONFIG.DEFAULTS.HIGHLIGHT,
        keywordsBlock: JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.BLOCK)) || CONFIG.DEFAULTS.BLOCK,
        isEnabled: JSON.parse(localStorage.getItem('isEnabled')) ?? true,
        fansubbersToggle: JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.FANSUBBERS_TOGGLE)) ?? false,
        minisToggle: JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.MINIS_TOGGLE)) ?? false,
        fansubbersBlacklist: JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.FANSUBBERS_BLACKLIST)) || [],
        minisBlacklist: JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.MINIS_BLACKLIST)) || [],
        blockedCategories: JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.BLOCKED_CATEGORIES)) || [],
        showAutoRules: JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.SHOW_AUTO_RULES)) ?? true,
        showManualRules: JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.SHOW_MANUAL_RULES)) ?? true,
        editMode: {
            isEditing: false,
            type: null,
            index: null,
            originalData: null
        },

        saveHighlightKeywords() {
            localStorage.setItem(CONFIG.STORAGE_KEYS.HIGHLIGHT, JSON.stringify(this.keywordsHighlight));
        },

        saveBlockKeywords() {
            localStorage.setItem(CONFIG.STORAGE_KEYS.BLOCK, JSON.stringify(this.keywordsBlock));
        },

        saveEnabledState() {
            localStorage.setItem('isEnabled', JSON.stringify(this.isEnabled));
        },

        saveToggleStates() {
            localStorage.setItem(CONFIG.STORAGE_KEYS.FANSUBBERS_TOGGLE, JSON.stringify(this.fansubbersToggle));
            localStorage.setItem(CONFIG.STORAGE_KEYS.MINIS_TOGGLE, JSON.stringify(this.minisToggle));
        },

        saveBlacklists() {
            localStorage.setItem(CONFIG.STORAGE_KEYS.FANSUBBERS_BLACKLIST, JSON.stringify(this.fansubbersBlacklist));
            localStorage.setItem(CONFIG.STORAGE_KEYS.MINIS_BLACKLIST, JSON.stringify(this.minisBlacklist));
        },

        resetEditMode() {
            this.editMode = {
                isEditing: false,
                type: null,
                index: null,
                originalData: null
            };
        },

        colors: {
            light: localStorage.getItem('highlightColorLight') || '#F0E68C', // khaki
            dark: localStorage.getItem('highlightColorDark') || '#330033' // purple
        },

        saveColors() {
            localStorage.setItem('highlightColorLight', this.colors.light);
            localStorage.setItem('highlightColorDark', this.colors.dark);
        },

        getCurrentHighlightColor() {
            return this.isDarkMode() ? this.colors.dark : this.colors.light;
        },

        isDarkMode() {
            const body = document.body;
            return body.classList.contains('dark');
        },

        saveFansubbersToggle() {
            localStorage.setItem(CONFIG.STORAGE_KEYS.FANSUBBERS_TOGGLE, JSON.stringify(this.fansubbersToggle));
        },

        saveMinisToggle() {
            localStorage.setItem(CONFIG.STORAGE_KEYS.MINIS_TOGGLE, JSON.stringify(this.minisToggle));
        },

        saveFansubbersBlacklist() {
            localStorage.setItem(CONFIG.STORAGE_KEYS.FANSUBBERS_BLACKLIST, JSON.stringify(this.fansubbersBlacklist));
        },

        saveMinisBlacklist() {
            localStorage.setItem(CONFIG.STORAGE_KEYS.MINIS_BLACKLIST, JSON.stringify(this.minisBlacklist));
        },

        saveBlockedCategories() {
            localStorage.setItem(CONFIG.STORAGE_KEYS.BLOCKED_CATEGORIES, JSON.stringify(this.blockedCategories));
        },

        saveRuleFilters() {
            localStorage.setItem(CONFIG.STORAGE_KEYS.SHOW_AUTO_RULES, JSON.stringify(this.showAutoRules));
            localStorage.setItem(CONFIG.STORAGE_KEYS.SHOW_MANUAL_RULES, JSON.stringify(this.showManualRules));
        }
    };

    // ============================================================================
    // CHIP INPUT COMPONENT
    // ============================================================================

    /**
     * Chip input component for managing keyword tags
     */
    class ChipInput {
        constructor(containerId, placeholder) {
            this.containerId = containerId;
            this.placeholder = placeholder;
            this.chips = [];
            this.container = null;
            this.input = null;
            this.display = null;
            this.init();
        }

        /**
         * Initialize the chip input component
         */
        init() {
            this.container = document.getElementById(this.containerId);
            if (!this.container) {
                console.error(`Container with ID ${this.containerId} not found`);
                return;
            }

            this.container.innerHTML = `
                <div class="chip-container">
                    <div class="chips-display"></div>
                    <input type="text" class="chip-input" placeholder="${this.placeholder}">
                </div>
            `;

            this.input = this.container.querySelector('.chip-input');
            this.display = this.container.querySelector('.chips-display');

            this.bindEvents();
            this.updateDisplay();
        }

        /**
         * Bind event listeners
         */
        bindEvents() {
            if (!this.input) return;

            this.input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && this.input.value.trim()) {
                    e.preventDefault();
                    this.addChip(sanitizeInput(this.input.value));
                    this.input.value = '';
                } else if (e.key === 'Backspace' && !this.input.value && this.chips.length > 0) {
                    this.removeChip(this.chips.length - 1);
                }
            });
        }

        /**
         * Add a new chip
         * @param {string} text - Chip text
         */
        addChip(text) {
            if (text && !this.chips.includes(text)) {
                this.chips.push(text);
                this.updateDisplay();
            }
        }

        /**
         * Remove chip at index
         * @param {number} index - Chip index
         */
        removeChip(index) {
            if (index >= 0 && index < this.chips.length) {
                this.chips.splice(index, 1);
                this.updateDisplay();
            }
        }

        /**
         * Set chips from array
         * @param {Array} chips - Array of chip texts
         */
        setChips(chips) {
            this.chips = Array.isArray(chips) ? [...chips] : [];
            this.updateDisplay();
        }

        /**
         * Get current chips
         * @returns {Array} Array of chip texts
         */
        getChips() {
            return [...this.chips];
        }

        /**
         * Clear all chips
         */
        clear() {
            this.chips = [];
            this.updateDisplay();
            if (this.input) {
                this.input.value = '';
            }
        }

        /**
         * Edit chip at index
         * @param {number} index - Chip index
         */
        editChip(index) {
            if (index >= 0 && index < this.chips.length) {
                const chipText = this.chips[index];
                this.chips.splice(index, 1);
                if (this.input) {
                    this.input.value = chipText;
                    this.input.focus();
                }
                this.updateDisplay();
            }
        }

        /**
         * Update the visual display of chips
         */
        updateDisplay() {
            if (!this.display) return;

            this.display.innerHTML = this.chips.map((chip, index) =>
                `<span class="chip" data-index="${index}">
                    ${chip}
                    <span class="chip-remove" data-index="${index}">×</span>
                </span>`
            ).join('');

            this.bindChipEvents();
            this.updatePlaceholder();
        }

        /**
         * Bind events for chip elements
         */
        bindChipEvents() {
            // Chip click for editing
            this.display.querySelectorAll('.chip').forEach(chipElement => {
                chipElement.addEventListener('click', (e) => {
                    if (e.target.classList.contains('chip-remove')) return;
                    e.stopPropagation();
                    const index = parseInt(chipElement.dataset.index);
                    this.editChip(index);
                });
            });

            // Remove button click
            this.display.querySelectorAll('.chip-remove').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    const index = parseInt(e.target.dataset.index);
                    this.removeChip(index);
                });
            });
        }

        /**
         * Update input placeholder text
         */
        updatePlaceholder() {
            if (this.input) {
                this.input.placeholder = this.chips.length === 0
                    ? this.placeholder
                    : 'Add additional word or phrase';
            }
        }
    }

    // ============================================================================
    // FILTERING LOGIC
    // ============================================================================

    /**
     * Check if title should be highlighted
     * @param {string} title - Title to check
     * @returns {boolean} True if should be highlighted
     */
    const shouldHighlightTitle = (title) => {
        if (!title || typeof title !== 'string') return false;

        return AppState.keywordsHighlight.some(([keywordParts, exceptionParts]) => {
            const keywordPredicates = keywordParts
                .filter(keyword => keyword && keyword.trim())
                .map(keyword => Chips.contains(keyword.trim()));

            const filteredExceptions = Array.isArray(exceptionParts)
                ? exceptionParts.filter(exception => exception && exception.trim())
                : [];

            const exceptionPredicates = filteredExceptions
                .map(exception => Chips.contains(exception.trim()));

            if (keywordPredicates.length === 0) return false;

            let chain = Chips.from(title).and(Chips.all(keywordPredicates));

            if (exceptionPredicates.length > 0) {
                chain = chain.not(Chips.any(exceptionPredicates));
            }

            return chain.result();
        });
    };

    /**
     * Check if title should be blocked
     * @param {string} title - Title to check
     * @returns {boolean} True if should be blocked
     */
    const shouldBlockTitle = (title) => {
        if (!title || typeof title !== 'string') return false;

        return AppState.keywordsBlock.some(([keywordParts, exceptionParts]) => {
            const keywordPredicates = keywordParts
                .filter(keyword => keyword && keyword.trim())
                .map(keyword => Chips.contains(keyword.trim()));

            const filteredExceptions = Array.isArray(exceptionParts)
                ? exceptionParts.filter(exception => exception && exception.trim())
                : [];

            const exceptionPredicates = filteredExceptions
                .map(exception => Chips.contains(exception.trim()));

            if (keywordPredicates.length === 0) return false;

            let chain = Chips.from(title).and(Chips.all(keywordPredicates));

            if (exceptionPredicates.length > 0) {
                chain = chain.not(Chips.any(exceptionPredicates));
            }

            return chain.result();
        });
    };

    // ============================================================================
    // DOM MANIPULATION
    // ============================================================================

    /**
     * Extract title from torrent row element
     * @param {Element} titleElement - Title element
     * @returns {string} Extracted title
     */
    const getTitleFromElement = (titleElement) => {
        if (!titleElement) return '';

        let title = titleElement.getAttribute('title') || titleElement.textContent.trim();

        if (titleElement.classList.contains('comments')) {
            const nextSibling = titleElement.nextElementSibling;
            if (nextSibling && nextSibling.tagName === 'A') {
                title = getTitleFromElement(nextSibling);
            }
        }

        return title || '';
    };

    /**
     * Get category from torrent row
     * @param {Element} row - Torrent row element
     * @returns {string} Category identifier
     */
    const getCategoryFromRow = (row) => {
        const categoryImg = row.querySelector('img[alt]');
        if (!categoryImg) return '';

        const alt = categoryImg.getAttribute('alt') || '';

        // Direct mapping from alt text to category IDs
        const categoryMap = isSukebei ? {
            'Art - Anime': 'art-anime',
            'Art - Doujinshi': 'art-doujinshi',
            'Art - Games': 'art-games',
            'Art - Manga': 'art-manga',
            'Art - Pictures': 'art-pictures',
            'Real Life - Photobooks and Pictures': 'real-life-photobooks',
            'Real Life - Videos': 'real-life-videos'
        } : {
            'Anime - AMV': 'anime-amv',
            'Anime - English-translated': 'anime-english',
            'Anime - Non-English-translated': 'anime-non-english',
            'Anime - Raw': 'anime-raw',
            'Audio - Lossless': 'audio-lossless',
            'Audio - Lossy': 'audio-lossy',
            'Literature - English-translated': 'literature-english',
            'Literature - Non-English-translated': 'literature-non-english',
            'Literature - Raw': 'literature-raw',
            'Live Action - English-translated': 'live-action-english',
            'Live Action - Idol/Promotional Video': 'live-action-idol',
            'Live Action - Non-English-translated': 'live-action-non-english',
            'Live Action - Raw': 'live-action-raw',
            'Pictures - Graphics': 'pictures-graphics',
            'Pictures - Photos': 'pictures-photos',
            'Software - Applications': 'software-applications',
            'Software - Games': 'software-games'
        };

        return categoryMap[alt] || '';
    };

    /**
     * Get the current category being browsed from URL
     * @returns {string|null} Current category ID or null if not browsing a specific category
     */
    const getCurrentBrowsingCategory = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const categoryParam = urlParams.get('c');

        if (!categoryParam) return null;

        // Map URL category codes to our category IDs
        const categoryCodeMap = isSukebei ? {
            '1_1': 'art-anime',
            '1_2': 'art-doujinshi',
            '1_3': 'art-games',
            '1_4': 'art-manga',
            '1_5': 'art-pictures',
            '2_1': 'real-life-photobooks',
            '2_2': 'real-life-videos'
        } : {
            '1_1': 'anime-amv',
            '1_2': 'anime-english',
            '1_3': 'anime-non-english',
            '1_4': 'anime-raw',
            '2_1': 'audio-lossless',
            '2_2': 'audio-lossy',
            '3_1': 'literature-english',
            '3_2': 'literature-non-english',
            '3_3': 'literature-raw',
            '4_1': 'live-action-english',
            '4_2': 'live-action-idol',
            '4_3': 'live-action-non-english',
            '4_4': 'live-action-raw',
            '5_1': 'pictures-graphics',
            '5_2': 'pictures-photos',
            '6_1': 'software-applications',
            '6_2': 'software-games'
        };

        return categoryCodeMap[categoryParam] || null;
    };

    /**
     * Update display of torrent rows based on current filters
     */
    const updateDisplay = debounce(() => {
        const rows = document.querySelectorAll(SELECTORS.TORRENT_ROWS);
        const currentBrowsingCategory = getCurrentBrowsingCategory();

        rows.forEach(row => {
            const titleElement = row.querySelector(SELECTORS.TITLE_ELEMENT);
            const title = getTitleFromElement(titleElement);
            const category = getCategoryFromRow(row);

            // Reset row if disabled
            if (!AppState.isEnabled) {
                resetRowAppearance(row);
                return;
            }

            // Check if category is blocked, but skip if it's the current browsing category
            if (category &&
                AppState.blockedCategories.includes(category) &&
                category !== currentBrowsingCategory) {
                row.style.display = 'none';
                return;
            }

            const shouldHighlight = shouldHighlightTitle(title);
            const shouldBlock = shouldBlockTitle(title);

            // Apply blocking first (higher priority)
            if (shouldBlock) {
                row.style.display = 'none';
            } else {
                row.style.display = '';

                // Apply highlighting
                if (shouldHighlight) {
                    applyHighlight(row);
                } else {
                    resetRowAppearance(row);
                }
            }
        });

        // Check if everything is blocked and show message if needed
        checkIfEverythingBlocked();
    }, CONFIG.DEBOUNCE_DELAY);

    /**
     * Apply highlight styling to row
     * @param {Element} row - Row element
     */
    const applyHighlight = (row) => {
        // Don't highlight rows with class="best", for nyaablue
        if (row.classList.contains('best')) {
            return;
        }

        if (!row.hasAttribute('data-old-class')) {
            row.setAttribute('data-old-class', row.className);
        }
        row.className = "default";

        // Use the current theme-appropriate highlight color
        row.style.backgroundColor = AppState.getCurrentHighlightColor();
    };

    const getBestClass = (row) => {
        if (row.classList.contains('best-alt')) return 'best-alt';
        if (row.classList.contains('best')) return 'best';
        return null;
    };

    /**
     * Reset row appearance to original state
     * @param {Element} row - Row element
     */
    const resetRowAppearance = (row, force = false) => {
        const bestClass = getBestClass(row);

        if (!force && bestClass) {
            return;
        }

        if (row.hasAttribute('data-old-class')) {
            row.className = row.getAttribute('data-old-class');

            if (bestClass) {
                row.classList.add(bestClass);
            }

            row.removeAttribute('data-old-class');
        }

        row.style.backgroundColor = '';
        row.style.display = '';
    };

    /**
     * Check if all rows are hidden and show appropriate message
     */
    const checkIfEverythingBlocked = () => {
        const rows = document.querySelectorAll(SELECTORS.TORRENT_ROWS);
        const visibleRows = Array.from(rows).filter(row => {
            const computedStyle = window.getComputedStyle(row);
            return computedStyle.display !== 'none';
        });

        let messageElement = document.getElementById('everything-blocked-message');

        // Only show message if script is enabled and there are rows but none are visible
        if (AppState.isEnabled && rows.length > 0 && visibleRows.length === 0) {
            if (!messageElement) {
                // Create the message element
                messageElement = document.createElement('div');
                messageElement.id = 'everything-blocked-message';
                messageElement.className = 'everything-blocked-message';
                messageElement.innerHTML = `
                    🚫 Everything's blocked! Maybe your blocking is a little too aggressive...
                    <div class="subtitle">Try adjusting your block rules or category filters in the <a href="#" id="open-settings-link" class="link-inline">settings</a>.</div>
                `;

                // Insert after the torrent table
                const torrentTable = document.querySelector('.torrent-list');
                if (torrentTable) {
                    torrentTable.parentNode.insertBefore(messageElement, torrentTable.nextSibling);
                } else {
                    // Fallback: insert after the first table found
                    const firstTable = document.querySelector('table');
                    if (firstTable) {
                        firstTable.parentNode.insertBefore(messageElement, firstTable.nextSibling);
                    }
                }
            }

            // Always rebind the click event (in case the element was recreated)
            const settingsLink = document.getElementById('open-settings-link');
            if (settingsLink) {
                // Remove any existing event listeners by cloning the element
                const newSettingsLink = settingsLink.cloneNode(true);
                settingsLink.parentNode.replaceChild(newSettingsLink, settingsLink);

                // Add the event listener to the new element
                newSettingsLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    // Make sure GUI is visible first
                    if (UI.guiContainer.style.display !== 'flex') {
                        UI.toggleGUI();
                    }
                });
            }

            messageElement.style.display = 'block';
        } else {
            // Hide message if it exists
            if (messageElement) {
                messageElement.style.display = 'none';
            }
        }
    };

    // ============================================================================
    // EDIT MODE MANAGEMENT
    // ============================================================================

    /**
     * Enter edit mode for a rule
     * @param {string} type - 'highlight' or 'block'
     * @param {number} index - Rule index
     */
    const enterEditMode = (type, index) => {
        // Exit current edit mode if different rule
        if (AppState.editMode.isEditing &&
            (AppState.editMode.type !== type || AppState.editMode.index !== index)) {
            exitEditMode();
        }

        AppState.editMode.isEditing = true;
        AppState.editMode.type = type;
        AppState.editMode.index = index;

        const keywords = type === 'highlight' ? AppState.keywordsHighlight : AppState.keywordsBlock;
        AppState.editMode.originalData = [...keywords[index]];

        const [keywordParts, exceptionParts] = keywords[index];

        if (type === 'highlight') {
            UI.chipInputs.highlightKeyword.setChips(keywordParts);
            UI.chipInputs.highlightException.setChips(exceptionParts);
            updateEditButton('add-keyword-highlight-btn', 'Update Highlight Rule');
            addCancelButton('highlight');
        } else {
            UI.chipInputs.blockKeyword.setChips(keywordParts);
            UI.chipInputs.blockException.setChips(exceptionParts);
            updateEditButton('add-keyword-block-btn', 'Update Block Rule');
            addCancelButton('block');
        }

        updateRuleLists();
    };

    /**
     * Exit edit mode
     */
    const exitEditMode = () => {
        AppState.resetEditMode();

        // Reset buttons
        updateEditButton('add-keyword-highlight-btn', 'Add Highlight Rule', '#555');
        updateEditButton('add-keyword-block-btn', 'Add Block Rule', '#555');

        // Remove cancel buttons
        removeCancelButtons();

        // Clear validation errors
        hideValidationError('highlight');
        hideValidationError('block');

        // Clear inputs
        if (UI.chipInputs) {
            Object.values(UI.chipInputs).forEach(input => input.clear());
        }

        updateRuleLists();
    };

    /**
     * Update edit button appearance
     * @param {string} buttonId - Button ID
     * @param {string} text - Button text
     * @param {string} color - Button color
     */
    const updateEditButton = (buttonId, text, color = '#28a745') => {
        const button = document.getElementById(buttonId);
        if (button) {
            button.textContent = text;
            button.style.backgroundColor = color;
        }
    };

    /**
     * Add cancel button for edit mode
     * @param {string} type - 'highlight' or 'block'
     */
    const addCancelButton = (type) => {
        const containerId = `${type}-cancel-container`;
        const targetButtonId = `add-keyword-${type}-btn`;
        const targetButton = document.getElementById(targetButtonId);

        if (!document.getElementById(containerId) && targetButton) {
            const cancelBtn = document.createElement('button');
            cancelBtn.id = containerId;
            cancelBtn.textContent = 'Cancel Edit';
            cancelBtn.className = 'action-button';
            cancelBtn.style.backgroundColor = '#dc3545';
            cancelBtn.style.marginLeft = '8px';
            cancelBtn.addEventListener('click', exitEditMode);

            targetButton.parentNode.insertBefore(cancelBtn, targetButton.nextSibling);
        }
    };

    /**
     * Remove cancel buttons
     */
    const removeCancelButtons = () => {
        ['highlight-cancel-container', 'block-cancel-container'].forEach(id => {
            const button = document.getElementById(id);
            if (button) button.remove();
        });
    };

    // ============================================================================
    // RULE MANAGEMENT
    // ============================================================================

    /**
     * Add or update highlight rule
     */
    const addKeywordToHighlight = () => {
        if (!UI.chipInputs) return;

        // Hide any existing validation errors
        hideValidationError('highlight');

        let keywordParts = UI.chipInputs.highlightKeyword.getChips();
        let exceptionParts = UI.chipInputs.highlightException.getChips();

        // Check for text in input fields that hasn't been converted to chips
        const keywordInputText = UI.chipInputs.highlightKeyword.input.value.trim();
        const exceptionInputText = UI.chipInputs.highlightException.input.value.trim();

        if (keywordInputText || exceptionInputText) {
            let warningMessage = 'Warning: You have text that hasn\'t been converted to chips.\nPress "Enter" in each field to convert text to chips, then try again.';
            showValidationError('highlight', warningMessage);
            return;
        }

        // Validation: Check if we have keywords
        if (keywordParts.length === 0) {
            showValidationError('highlight', 'Error: Please add at least one keyword.');
            return;
        }

        // Validation: Check if only exceptions without keywords (redundant but kept for clarity)
        if (keywordParts.length === 0 && exceptionParts.length > 0) {
            showValidationError('highlight', 'Error: Cannot create a rule with only exceptions. Please add at least one keyword.');
            return;
        }

        if (AppState.editMode.isEditing && AppState.editMode.type === 'highlight') {
            // Update existing rule
            AppState.keywordsHighlight[AppState.editMode.index] = [keywordParts, exceptionParts];
            exitEditMode();
        } else {
            // Add new rule if not duplicate
            const isDuplicate = AppState.keywordsHighlight.some(([existingKeywords, existingExceptions]) => {
                return arraysEqual(existingKeywords, keywordParts) &&
                    arraysEqual(existingExceptions, exceptionParts);
            });

            if (!isDuplicate) {
                AppState.keywordsHighlight.push([keywordParts, exceptionParts]);
                sortRules(AppState.keywordsHighlight);
            }

            UI.chipInputs.highlightKeyword.clear();
            UI.chipInputs.highlightException.clear();
        }

        AppState.saveHighlightKeywords();
        updateRuleLists();
        updateDisplay();
    };

    /**
     * Add or update block rule
     */
    const addKeywordToBlock = () => {
        if (!UI.chipInputs) return;

        // Hide any existing validation errors
        hideValidationError('block');

        let keywordParts = UI.chipInputs.blockKeyword.getChips();
        let exceptionParts = UI.chipInputs.blockException.getChips();

        // Check for text in input fields that hasn't been converted to chips
        const keywordInputText = UI.chipInputs.blockKeyword.input.value.trim();
        const exceptionInputText = UI.chipInputs.blockException.input.value.trim();

        if (keywordInputText || exceptionInputText) {
            let warningMessage = 'Warning: You have text that hasn\'t been converted to chips.\nPress "Enter" in each field to convert text to chips, then try again.';
            showValidationError('block', warningMessage);
            return;
        }

        // Validation: Check if we have keywords
        if (keywordParts.length === 0) {
            showValidationError('block', 'Error: Please add at least one keyword.');
            return;
        }

        // Validation: Check if only exceptions without keywords (redundant but kept for clarity)
        if (keywordParts.length === 0 && exceptionParts.length > 0) {
            showValidationError('block', 'Error: Cannot create a rule with only exceptions. Please add at least one keyword.');
            return;
        }

        if (AppState.editMode.isEditing && AppState.editMode.type === 'block') {
            // Update existing rule
            AppState.keywordsBlock[AppState.editMode.index] = [keywordParts, exceptionParts];
            exitEditMode();
        } else {
            // Add new rule if not duplicate
            const isDuplicate = AppState.keywordsBlock.some(([existingKeywords, existingExceptions]) => {
                return arraysEqual(existingKeywords, keywordParts) &&
                    arraysEqual(existingExceptions, exceptionParts);
            });

            if (!isDuplicate) {
                AppState.keywordsBlock.push([keywordParts, exceptionParts]);
                sortRules(AppState.keywordsBlock);
            }

            UI.chipInputs.blockKeyword.clear();
            UI.chipInputs.blockException.clear();
        }

        AppState.saveBlockKeywords();
        updateRuleLists();
        updateDisplay();
    };

    /**
     * Remove a blacklist rule
     * @param {string} type - 'fansubbers' or 'minis'
     * @param {number} index - Rule index
     */
    const removeBlacklistRule = (type, index) => {
        const list = type === 'fansubbers' ? AppState.fansubbersBlacklist : AppState.minisBlacklist;
        if (!list || index < 0 || index >= list.length) return;
        const removedRule = list[index];
        list.splice(index, 1);
        AppState.saveBlacklists();

        if (type === 'fansubbers') {
            const isDuplicate = AppState.keywordsHighlight.some(([existingKeywords, existingExceptions]) => {
                return arraysEqual(existingKeywords, removedRule[0]) &&
                    arraysEqual(existingExceptions, removedRule[1]);
            });
            if (!isDuplicate) {
                AppState.keywordsHighlight.push([removedRule[0], removedRule[1]]);
                sortRules(AppState.keywordsHighlight);
                AppState.saveHighlightKeywords();
            }
        } else {
            const isDuplicate = AppState.keywordsBlock.some(([existingKeywords, existingExceptions]) => {
                return arraysEqual(existingKeywords, removedRule[0]) &&
                    arraysEqual(existingExceptions, removedRule[1]);
            });
            if (!isDuplicate) {
                AppState.keywordsBlock.push([removedRule[0], removedRule[1]]);
                sortRules(AppState.keywordsBlock);
                AppState.saveBlockKeywords();
            }
        }

        updateBlacklistLists();
        updateRuleLists();
        updateDisplay();
    };

    /**
     * Sort rules alphabetically by first keyword, ignoring leading brackets and parentheses
     * @param {Array} rules - Rules array to sort
     */
    const sortRules = (rules) => {
        rules.sort((a, b) => {
            // Get the first keyword from each rule and remove leading brackets and parentheses
            const keywordA = a[0].join(' ').toLowerCase().replace(/^[\[\(]/, '');
            const keywordB = b[0].join(' ').toLowerCase().replace(/^[\[\(]/, '');
            return keywordA.localeCompare(keywordB);
        });
    };

    /**
     * Check if a rule matches the auto-import presets for its type
     * @param {string} type - 'highlight' or 'block'
     * @param {Array} keywordParts
     * @param {Array} exceptionParts
     * @returns {boolean}
     */
    const isPresetRuleForType = (type, keywordParts, exceptionParts) => {
        const presets = type === 'highlight' ? PRESETS.FANSUBBERS : PRESETS.MINIS;
        const defaults = type === 'highlight' ? CONFIG.DEFAULTS.HIGHLIGHT : CONFIG.DEFAULTS.BLOCK;
        const matches = (rule) =>
            arraysEqual(rule[0], keywordParts) &&
            arraysEqual(rule[1], exceptionParts);

        return presets.some(matches) || defaults.some(matches);
    };

    /**
     * Show validation error message
     * @param {string} type - 'highlight' or 'block'
     * @param {string} message - Error message to display
     */
    const showValidationError = (type, message) => {
        const errorElement = document.getElementById(`${type}-validation-error`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');

            // Auto-hide after 10 seconds
            setTimeout(() => {
                hideValidationError(type);
            }, 10000);
        }
    };

    /**
     * Hide validation error message
     * @param {string} type - 'highlight' or 'block'
     */
    const hideValidationError = (type) => {
        const errorElement = document.getElementById(`${type}-validation-error`);
        if (errorElement) {
            errorElement.classList.remove('show');
            errorElement.textContent = '';
        }
    };

    /**
     * Remove rule by index
     * @param {string} type - 'highlight' or 'block'
     * @param {number} index - Rule index
     */
    const removeRule = (type, index) => {
        if (type === 'highlight') {
            const removedRule = AppState.keywordsHighlight[index];

            // Check if this rule came from fansubbers preset and add to blacklist
            const isFromFansubbers = PRESETS.FANSUBBERS.some(presetRule =>
                arraysEqual(presetRule[0], removedRule[0]) &&
                arraysEqual(presetRule[1], removedRule[1])
            );

            if (isFromFansubbers) {
                AppState.fansubbersBlacklist.push([...removedRule]);
                AppState.saveBlacklists();
            }

            AppState.keywordsHighlight.splice(index, 1);
            AppState.saveHighlightKeywords();
        } else {
            const removedRule = AppState.keywordsBlock[index];

            // Check if this rule came from minis preset and add to blacklist
            const isFromMinis = PRESETS.MINIS.some(presetRule =>
                arraysEqual(presetRule[0], removedRule[0]) &&
                arraysEqual(presetRule[1], removedRule[1])
            );

            if (isFromMinis) {
                AppState.minisBlacklist.push([...removedRule]);
                AppState.saveBlacklists();
            }

            AppState.keywordsBlock.splice(index, 1);
            AppState.saveBlockKeywords();
        }

        updateRuleLists();
        updateDisplay();
    };


    /**
     * Merge incoming rules into target list, skipping duplicates
     * @param {Array} targetRules - Existing rules array
     * @param {Array} incomingRules - Rules to merge in
     * @returns {number} Count of rules added
     */
    const mergeRules = (targetRules, incomingRules) => {
        let added = 0;
        (incomingRules || []).forEach((newRule) => {
            const isDuplicate = targetRules.some(existingRule =>
                arraysEqual(existingRule[0], newRule[0]) &&
                arraysEqual(existingRule[1], newRule[1])
            );
            if (!isDuplicate) {
                targetRules.push([...newRule]);
                added++;
            }
        });

        if (added > 0) {
            sortRules(targetRules);
        }

        return added;
    };

    /**
     * Export configuration to JSON file
     */
    const exportConfiguration = () => {
        const config = {
            version: "1.0",
            timestamp: new Date().toISOString(),
            keywordsHighlight: AppState.keywordsHighlight,
            keywordsBlock: AppState.keywordsBlock,
            isEnabled: AppState.isEnabled,
            colors: AppState.colors,
            fansubbersToggle: AppState.fansubbersToggle,
            minisToggle: AppState.minisToggle,
            fansubbersBlacklist: AppState.fansubbersBlacklist,
            minisBlacklist: AppState.minisBlacklist,
            blockedCategories: AppState.blockedCategories
        };


        const dataStr = JSON.stringify(config, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `nyaa-highlight-block-config-${new Date().toISOString().split('T')[0]}.json`;
        link.click();

        URL.revokeObjectURL(link.href);
    };

    /**
     * Show import mode modal and resolve with chosen mode
     * @returns {Promise<'merge'|'override'|null>}
     */
    const openImportModeModal = () => {
        return new Promise((resolve) => {
            const overlay = document.getElementById('import-mode-modal');
            const mergeBtn = document.getElementById('import-mode-merge');
            const overrideBtn = document.getElementById('import-mode-override');
            const cancelBtn = document.getElementById('import-mode-cancel');
            const closeBtn = document.getElementById('import-mode-close');

            if (!overlay || !mergeBtn || !overrideBtn || !cancelBtn || !closeBtn) {
                resolve(null);
                return;
            }

            const cleanup = (result) => {
                overlay.style.display = 'none';
                mergeBtn.removeEventListener('click', onMerge);
                overrideBtn.removeEventListener('click', onOverride);
                cancelBtn.removeEventListener('click', onCancel);
                closeBtn.removeEventListener('click', onCancel);
                overlay.removeEventListener('click', onOverlayClick);
                resolve(result);
            };

            const onMerge = (e) => {
                e.preventDefault();
                cleanup('merge');
            };

            const onOverride = (e) => {
                e.preventDefault();
                cleanup('override');
            };

            const onCancel = (e) => {
                e.preventDefault();
                cleanup(null);
            };

            const onOverlayClick = (e) => {
                if (e.target === overlay) {
                    cleanup(null);
                }
            };

            mergeBtn.addEventListener('click', onMerge);
            overrideBtn.addEventListener('click', onOverride);
            cancelBtn.addEventListener('click', onCancel);
            closeBtn.addEventListener('click', onCancel);
            overlay.addEventListener('click', onOverlayClick);

            overlay.style.display = 'flex';
        });
    };

    /**
     * Show import confirm modal and resolve with confirmation
     * @param {object} summary - Summary of import contents
     * @param {string} mode - 'merge' or 'override'
     * @returns {Promise<boolean>}
     */
    const openImportConfirmModal = (summary, mode) => {
        return new Promise((resolve) => {
            const overlay = document.getElementById('import-confirm-modal');
            const summaryEl = document.getElementById('import-confirm-summary');
            const warningEl = document.getElementById('import-confirm-warning');
            const yesBtn = document.getElementById('import-confirm-yes');
            const noBtn = document.getElementById('import-confirm-no');
            const closeBtn = document.getElementById('import-confirm-close');

            if (!overlay || !summaryEl || !warningEl || !yesBtn || !noBtn || !closeBtn) {
                resolve(false);
                return;
            }

            const isDefaultColors = (colors) => {
                if (!colors) return true;
                const light = colors.light || '#F0E68C';
                const dark = colors.dark || '#330033';
                return light === '#F0E68C' && dark === '#330033';
            };

            const colorNote = summary.hasColors && !isDefaultColors(summary.colors)
                ? ', Custom colors: Yes.'
                : '.';

            summaryEl.textContent =
                mode === 'merge'
                    ? `Import contains: ${summary.highlightCount} highlight rules, ${summary.blockCount} block rules.`
                    : `Import contains: ${summary.highlightCount} highlight rules, ${summary.blockCount} block rules${colorNote}`;

            warningEl.textContent =
                mode === 'merge'
                    ? 'Merge will keep your current settings and add rules from the file.'
                    : 'Override will replace ALL your current settings with the file.';

            const cleanup = (result) => {
                overlay.style.display = 'none';
                yesBtn.removeEventListener('click', onYes);
                noBtn.removeEventListener('click', onNo);
                closeBtn.removeEventListener('click', onNo);
                overlay.removeEventListener('click', onOverlayClick);
                resolve(result);
            };

            const onYes = (e) => {
                e.preventDefault();
                cleanup(true);
            };

            const onNo = (e) => {
                e.preventDefault();
                cleanup(false);
            };

            const onOverlayClick = (e) => {
                if (e.target === overlay) {
                    cleanup(false);
                }
            };

            yesBtn.addEventListener('click', onYes);
            noBtn.addEventListener('click', onNo);
            closeBtn.addEventListener('click', onNo);
            overlay.addEventListener('click', onOverlayClick);

            overlay.style.display = 'flex';
        });
    };

    /**
     * Show notice modal with optional cancel button
     * @param {object} options
     * @param {string} options.title
     * @param {string} options.message
     * @param {boolean} [options.showCancel=false]
     * @returns {Promise<boolean>}
     */
    const openNoticeModal = ({ title, message, showCancel = false, okText = 'OK', cancelText = 'Cancel' }) => {
        return new Promise((resolve) => {
            const overlay = document.getElementById('notice-modal');
            const titleEl = document.getElementById('notice-title');
            const messageEl = document.getElementById('notice-message');
            const okBtn = document.getElementById('notice-ok');
            const cancelBtn = document.getElementById('notice-cancel');
            const closeBtn = document.getElementById('notice-close');

            if (!overlay || !titleEl || !messageEl || !okBtn || !cancelBtn || !closeBtn) {
                resolve(false);
                return;
            }

            titleEl.textContent = title || 'Notice';
            messageEl.textContent = message || '';

            if (showCancel) {
                cancelBtn.classList.remove('hb-hidden');
            } else {
                cancelBtn.classList.add('hb-hidden');
            }

            const cleanup = (result) => {
                overlay.style.display = 'none';
                okBtn.removeEventListener('click', onOk);
                cancelBtn.removeEventListener('click', onCancel);
                closeBtn.removeEventListener('click', onCancel);
                overlay.removeEventListener('click', onOverlayClick);
                resolve(result);
            };

            const onOk = (e) => {
                e.preventDefault();
                cleanup(true);
            };

            const onCancel = (e) => {
                e.preventDefault();
                cleanup(false);
            };

            const onOverlayClick = (e) => {
                if (e.target === overlay) {
                    cleanup(false);
                }
            };

            okBtn.textContent = okText;
            cancelBtn.textContent = cancelText;

            okBtn.addEventListener('click', onOk);
            cancelBtn.addEventListener('click', onCancel);
            closeBtn.addEventListener('click', onCancel);
            overlay.addEventListener('click', onOverlayClick);

            overlay.style.display = 'flex';
        });
    };

    /**
     * Import configuration from JSON file
     */
    const importConfiguration = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        const handleFile = (mode, file) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const config = JSON.parse(e.target.result);

                    // Validate the configuration structure
                    if (!config.keywordsHighlight || !config.keywordsBlock) {
                        await openNoticeModal({
                            title: 'Import Error',
                            message: 'Invalid configuration file format.'
                        });
                        return;
                    }

                    const highlightCount = (config.keywordsHighlight || []).length;
                    const blockCount = (config.keywordsBlock || []).length;

                    const confirmed = await openImportConfirmModal({
                        highlightCount,
                        blockCount,
                        hasColors: !!config.colors,
                        colors: config.colors
                    }, mode);

                    if (!confirmed) return;

                    if (mode === 'merge') {
                        const addedHighlights = mergeRules(AppState.keywordsHighlight, config.keywordsHighlight);
                        const addedBlocks = mergeRules(AppState.keywordsBlock, config.keywordsBlock);

                        AppState.saveHighlightKeywords();
                        AppState.saveBlockKeywords();

                        updateRuleLists();
                        updateDisplay();

                        await openNoticeModal({
                            title: 'Import Complete',
                            message:
                                'Merge complete.\n' +
                                `- Added ${addedHighlights} highlight rules\n` +
                                `- Added ${addedBlocks} block rules`
                        });
                        return;
                    }

                    AppState.keywordsHighlight = config.keywordsHighlight || [];
                    AppState.keywordsBlock = config.keywordsBlock || [];
                    AppState.isEnabled = config.isEnabled !== undefined ? config.isEnabled : true;
                    AppState.fansubbersToggle = config.fansubbersToggle ?? false;
                    AppState.minisToggle = config.minisToggle ?? false;
                    AppState.fansubbersBlacklist = config.fansubbersBlacklist || [];
                    AppState.minisBlacklist = config.minisBlacklist || [];
                    AppState.blockedCategories = config.blockedCategories || [];

                    if (config.colors) {
                        AppState.colors = {
                            light: config.colors.light || '#F0E68C',
                            dark: config.colors.dark || '#330033'
                        };
                    }

                    AppState.saveHighlightKeywords();
                    AppState.saveBlockKeywords();
                    AppState.saveEnabledState();
                    AppState.saveToggleStates();
                    AppState.saveBlacklists();
                    AppState.saveBlockedCategories();
                    AppState.saveColors();

                    updateRuleLists();
                    updateDisplay();

                    const lightPicker = document.getElementById('light-color-picker');
                    const darkPicker = document.getElementById('dark-color-picker');
                    if (lightPicker) lightPicker.value = AppState.colors.light;
                    if (darkPicker) darkPicker.value = AppState.colors.dark;

                    const toggleSwitch = document.getElementById('toggle-highlight-block-switch');
                    const fansubbersToggle = document.getElementById('fansubbers-toggle');
                    const minisToggle = document.getElementById('minis-toggle');
                    if (toggleSwitch) toggleSwitch.checked = AppState.isEnabled;
                    if (fansubbersToggle) fansubbersToggle.checked = AppState.fansubbersToggle;
                    if (minisToggle) minisToggle.checked = AppState.minisToggle;

                    await openNoticeModal({
                        title: 'Import Complete',
                        message: 'Configuration imported successfully!'
                    });
                } catch (error) {
                    await openNoticeModal({
                        title: 'Import Error',
                        message: 'Could not parse configuration file. Please ensure it\'s a valid JSON file.'
                    });
                    console.error('Import error:', error);
                }
            };
            reader.readAsText(file);
        };

        input.onchange = async (event) => {
            const file = event.target.files[0];
            if (!file) return;
            // mode stored on input
            const mode = input.dataset.importMode;
            if (!mode) return;
            handleFile(mode, file);
        };

        openImportModeModal().then((mode) => {
            if (!mode) return;
            input.dataset.importMode = mode;
            input.click();
        });
    };

    /**
     * Reset all settings to default values
     */
    const resetToDefaultSettings = async () => {
        const confirmed = await openNoticeModal({
            title: 'Reset Settings',
            message:
                'Warning: This will reset ALL settings to their original defaults.\n' +
                'If you haven\'t already, it may be worth exporting your configuration first.\n\n' +
                'This will:\n' +
                '- Reset highlight and block lists to original limited sets\n' +
                '- Clear all blacklists\n' +
                '- Turn off fansubbers and minis auto-import toggles\n' +
                '- Reset highlight colors to defaults\n' +
                '- Clear blocked categories\n' +
                '- Enable the script if it was disabled\n\n' +
                'This action cannot be undone. Do you want to continue?',
            showCancel: true
        });

        if (confirmed) {
            // Reset to original defaults
            AppState.keywordsHighlight = [...CONFIG.DEFAULTS.HIGHLIGHT];
            AppState.keywordsBlock = [...CONFIG.DEFAULTS.BLOCK];
            AppState.isEnabled = true;
            AppState.fansubbersToggle = false;
            AppState.minisToggle = false;
            AppState.fansubbersBlacklist = [];
            AppState.minisBlacklist = [];
            AppState.blockedCategories = [];
            AppState.colors = {
                light: '#F0E68C', // khaki
                dark: '#330033' // purple
            };

            // Save all settings
            AppState.saveHighlightKeywords();
            AppState.saveBlockKeywords();
            AppState.saveEnabledState();
            AppState.saveToggleStates();
            AppState.saveBlacklists();
            AppState.saveBlockedCategories();
            AppState.saveColors();

            exitEditMode();

            updateRuleLists();
            updateDisplay();

            const toggleSwitch = document.getElementById('toggle-highlight-block-switch');
            const fansubbersToggle = document.getElementById('fansubbers-toggle');
            const minisToggle = document.getElementById('minis-toggle');

            if (toggleSwitch) toggleSwitch.checked = true;
            if (fansubbersToggle) fansubbersToggle.checked = false;
            if (minisToggle) minisToggle.checked = false;

            const lightPicker = document.getElementById('light-color-picker');
            const darkPicker = document.getElementById('dark-color-picker');
            if (lightPicker) lightPicker.value = AppState.colors.light;
            if (darkPicker) darkPicker.value = AppState.colors.dark;

            const categoryCheckboxes = document.querySelectorAll('.category-checkbox');
            categoryCheckboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
        }
    };

    // ============================================================================
    // COLOR PICKER HANDLERS
    // ============================================================================

    /**
    * Handle light mode color change
    */
    const handleLightColorChange = (event) => {
        AppState.colors.light = event.target.value;
        AppState.saveColors();
        updateDisplay();
    };

    /**
     * Handle dark mode color change
     */
    const handleDarkColorChange = (event) => {
        AppState.colors.dark = event.target.value;
        AppState.saveColors();
        updateDisplay();
    };

    /**
     * Reset light mode color to default
     */
    const resetLightColor = () => {
        AppState.colors.light = '#F0E68C'; // khaki
        AppState.saveColors();
        const lightPicker = document.getElementById('light-color-picker');
        if (lightPicker) {
            lightPicker.value = AppState.colors.light;
        }
        updateDisplay();
    };

    /**
     * Reset dark mode color to default
     */
    const resetDarkColor = () => {
        AppState.colors.dark = '#330033'; // purple
        AppState.saveColors();
        const darkPicker = document.getElementById('dark-color-picker');
        if (darkPicker) {
            darkPicker.value = AppState.colors.dark;
        }
        updateDisplay();
    };

    // ============================================================================
    // THEME AND NYAABLUE MONITORING
    // ============================================================================

    /**
     * Monitor body class changes for theme switching and nyaablue
     */
    const initThemeAndNyaaBlueMonitoring = () => {
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type !== 'attributes' || mutation.attributeName !== 'class') {
                    continue;
                }

                const target = mutation.target;

                // Theme switch
                if (target === document.body) {
                    updateDisplay();
                    continue;
                }

                // Nyaablue load
                if (target.matches?.('tr') && getBestClass(target)) {
                    resetRowAppearance(target, true);
                }
            }
        });

        // Observe body for theme changes
        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['class']
        });

        // Observe all existing rows for late-added classes
        document.querySelectorAll('tr').forEach(row => {
            observer.observe(row, {
                attributes: true,
                attributeFilter: ['class']
            });
        });
    };


    // ============================================================================
    // UI MANAGEMENT
    // ============================================================================

    /**
     * UI management object
     */
    const UI = {
        guiContainer: null,
        openButton: null,
        chipInputs: null,

        /**
         * Initialize the user interface
         */
        init() {
            this.createStyles();
            this.createGUIContainer();
            this.createOpenButton();
            this.bindEvents();
            this.initializeChipInputs();
            updateRuleLists();
        },

        /**
         * Create CSS styles
         */
        createStyles() {
            const style = document.createElement('style');
            style.textContent = `
                .chip-container {
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    min-height: 32px;
                    padding: 4px;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                    background-color: #f5f5f5;
                    margin-bottom: 8px;
                    gap: 4px;
                }

                .chips-display {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 4px;
                }

                .chip {
                    display: inline-flex;
                    align-items: center;
                    background-color: #28a745;
                    color: white;
                    padding: 4px 8px;
                    border-radius: 16px;
                    font-size: 12px;
                    white-space: nowrap;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }

                .chip:hover {
                    background-color: #1e7e34;
                }

                #highlight-exception-container .chip,
                #block-exception-container .chip {
                    background-color: #dc3545;
                }

                #highlight-exception-container .chip:hover,
                #block-exception-container .chip:hover {
                    background-color: #c82333;
                }

                .chip-remove {
                    margin-left: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    user-select: none;
                    z-index: 1;
                    position: relative;
                }

                .chip-remove:hover {
                    color: #ff6b6b;
                }

                .chip-input {
                    border: none !important;
                    outline: none !important;
                    background: transparent !important;
                    color: #333 !important;
                    flex: 1;
                    min-width: 80px;
                    padding: 2px !important;
                    margin: 0 !important;
                    font-size: 14px;
                }

                .rule-list {
                    overflow-y: auto;
                    padding: 5px;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                    max-height: calc(90vh - 300px);
                    min-height: 50px;
                }

                .side-by-side {
                    display: flex;
                    justify-content: space-between;
                    gap: 20px;
                }

                .side-by-side > div {
                    width: 49%;
                    display: flex;
                    flex-direction: column;
                }

                .keyword-input {
                    display: flex;
                    flex-direction: column;
                    margin-bottom: 15px;
                    flex-shrink: 0;
                }

                .action-button {
                    border: 1px solid #333;
                    border-radius: 5px;
                    background-color: #555;
                    padding: 8px 12px;
                    color: white;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }

                .action-button:hover:not(:disabled) {
                    background-color: #666;
                }

                .action-button:disabled {
                    background-color: #888;
                    cursor: not-allowed;
                    opacity: 0.6;
                }

                .action-button.danger {
                    background-color: #dc3545;
                    border-color: #c82333;
                }

                .action-button.danger:hover:not(:disabled) {
                    background-color: #c82333;
                }

                .switch {
                    position: relative;
                    display: inline-block;
                    width: 34px;
                    height: 20px;
                }

                .switch input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }

                .slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: #dc3545;
                    transition: .4s;
                    border-radius: 34px;
                }

                .slider:before {
                    position: absolute;
                    content: "";
                    height: 12px;
                    width: 12px;
                    border-radius: 50%;
                    left: 4px;
                    bottom: 4px;
                    background-color: white;
                    transition: .4s;
                }

                input:checked + .slider {
                    background-color: #4CAF50;
                }

                input:checked + .slider:before {
                    transform: translateX(14px);
                }

                #guiContainer h3 {
                    margin-top: 0px;
                }

                .rule-item {
                    display: flex;
                    align-items: center;
                    padding: 4px;
                    margin-bottom: 4px;
                    border: 1px solid #555;
                    border-radius: 8px;
                    background-color: #2a2a2a;
                    min-height: 32px;
                }

                .rule-item.editing {
                    border: 2px solid #ffc107;
                    background-color: #3a3a2a;
                }

                .filter-row {
                    justify-content: space-between;
                    align-items: center;
                }

                .filter-inline {
                    display: flex;
                    gap: 6px;
                    margin-left: auto;
                    flex-wrap: wrap;
                }

                .filter-chip {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 11px;
                    color: #ccc;
                    cursor: pointer;
                    border: 1px solid #555;
                    border-radius: 12px;
                    padding: 2px 8px;
                    background-color: #2a2a2a;
                }

                .filter-chip input {
                    margin: 0;
                    cursor: pointer;
                }

                .rule-buttons {
                    flex-shrink: 0;
                    margin-right: 8px;
                }

                .rule-keywords {
                    flex-grow: 1;
                    margin-right: 8px;
                }

                .rule-exceptions {
                    flex-shrink: 0;
                }

                .colored-chip {
                    color: white;
                    padding: 2px 6px;
                    border-radius: 12px;
                    margin: 2px;
                    display: inline-block;
                    font-size: 12px;
                }

                .green-chip {
                    background-color: #28a745;
                }

                .red-chip {
                    background-color: #dc3545;
                }

                .auto-badge {
                    background-color: #6c757d;
                    color: white;
                    padding: 2px 6px;
                    border-radius: 12px;
                    margin: 2px;
                    display: inline-block;
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 0.3px;
                }

                .button-group {
                    display: flex;
                    gap: 4px;
                }

                .rule-button {
                    padding: 4px 8px;
                    font-size: 12px;
                }

                .validation-error {
                    color: #dc3545;
                    font-size: 12px;
                    margin-top: 4px;
                    display: none;
                    white-space: pre-line;
                    line-height: 1.4;
                }

                .validation-error.show {
                    display: block;
                }

                .section-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 15px;
                }

                .section-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin: 0;
                }

                .help-icon {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background-color: #666;
                    color: white;
                    border: none;
                    cursor: pointer;
                    font-size: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background-color 0.2s;
                    margin-bottom:10px
                }

                .help-icon:hover {
                    background-color: #777;
                }

                .close-x {
                    background: none;
                    border: none;
                    color: #ccc;
                    font-size: 20px;
                    cursor: pointer;
                    margin-top: -5px;
                    margin-bottom: 7px;
                }

                .close-x:hover {
                    color: white;
                }

                .help-popup, .settings-overlay {
                    position: fixed;
                    top: 5vh;
                    bottom: 5vh;
                    left: 50%;
                    transform: translateX(-50%);
                    background-color: #2a2a2a;
                    color: white;
                    padding: 20px;
                    z-index: 10002;
                    border: 1px solid #555;
                    border-radius: 10px;
                    display: none;
                    min-width: 55%;
                    max-width: 900px;
                    overflow-y: auto;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.5);
                }

                .help-popup h3 {
                    margin: 0 0 12px 0;
                    font-size: 18px;
                    border-bottom: 1px solid #444;
                    padding-bottom: 8px;
                }

                .help-popup p {
                    margin: 16px 0 6px 0;
                    font-size: 12px;
                    color: #ddd;
                    text-transform: uppercase;
                    letter-spacing: 0.6px;
                }

                .help-popup ul {
                    margin: 0 0 12px 0;
                    padding-left: 18px;
                }

                .help-popup li {
                    margin: 6px 0;
                    line-height: 1.5;
                    color: #ccc;
                }

                .help-list-item {
                    margin-left: 20px;
                    padding-left: 6px;
                    display: block;
                }

                .help-list-item.spaced {
                    margin-top: 8px;
                }

                .help-close {
                    float: right;
                    background: none;
                    border: none;
                    color: #ccc;
                    font-size: 20px;
                    cursor: pointer;
                    margin-top: -5px;
                }

                .help-close:hover {
                    color: white;
                }

                .toggle-container {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .toggle-label {
                    font-size: 12px;
                    color: #ccc;
                    white-space: nowrap;
                    font-weight: normal;
                }

                .link-inline {
                    color: #007bff;
                    text-decoration: underline;
                    cursor: pointer;
                }

                .preset-btn {
                    padding: 8px 16px;
                    font-size: 12px;
                    background-color: #28a745;
                    border: 1px solid #1e7e34;
                    border-radius: 4px;
                    color: white;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }

                .preset-btn:hover {
                    background-color: #218838;
                }

                .preset-btn.minis-btn {
                    background-color: #dc3545;
                    border: 1px solid #c82333;
                }

                .preset-btn.minis-btn:hover {
                    background-color: #c82333;
                }

                .top-right-controls {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    flex-wrap: wrap;
                }

                .color-picker-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 8px;
                }

                .color-picker-row:last-child {
                    margin-bottom: 0;
                }

                .color-picker {
                    width: 50px;
                    height: 30px;
                    border: 1px solid #666;
                    border-radius: 4px;
                    cursor: pointer;
                    background: none;
                    padding: 0;
                }

                .color-picker::-webkit-color-swatch-wrapper {
                    padding: 0;
                    border: none;
                    border-radius: 4px;
                }

                .color-picker::-webkit-color-swatch {
                    border: none;
                    border-radius: 4px;
                }

                .color-picker-active #guiContainer {
                    display: none !important;
                }

                .color-picker-active .settings-overlay {
                    display: block !important;
                }

                .reset-color-btn {
                    width: 30px;
                    height: 30px;
                    border: 1px solid #666;
                    border-radius: 4px;
                    background-color: #555;
                    color: #ccc;
                    cursor: pointer;
                    font-size: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background-color 0.2s;
                }

                .reset-color-btn:hover {
                    background-color: #666;
                    color: white;
                }

                .color-preview {
                    margin-left: 8px;
                    font-size: 11px;
                    color: #999;
                    font-style: italic;
                }

                .settings-cog {
                    background: none;
                    border: none;
                    color: #ccc;
                    font-size: 20px;
                    cursor: pointer;
                    margin-top: -7px;
                    transition: color 0.2s, transform 0.2s;
                }

                .settings-cog:hover {
                    color: white;
                    transform: rotate(90deg);
                }

                .settings-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    border-bottom: 1px solid #555;
                    padding-bottom: 10px;
                }

                .settings-header h3 {
                    margin: 0;
                }

                .settings-content {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .settings-section {
                    border: 1px solid #555;
                    border-radius: 8px;
                    padding: 15px;
                    background-color: #2a2a2a;
                }

                .settings-section h4 {
                    margin: 0 0 15px 0;
                    color: #ccc;
                    font-size: 14px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .settings-buttons {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                }

                .settings-buttons.column-left {
                    flex-direction: column;
                    align-items: flex-start;
                }

                .blacklist-description {
                    font-size: 12px;
                    color: #ccc;
                    margin-top: 10px;
                    margin-bottom: 10px;
                    line-height: 1.4;
                }

                .blacklist-section {
                    display: flex;
                    gap: 20px;
                    flex-wrap: wrap;
                }

                .blacklist-group {
                    width: 49%;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .blacklist-label {
                    font-size: 12px;
                    color: #ccc;
                }

                .hb-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.6);
                    display: none;
                    align-items: center;
                    justify-content: center;
                    z-index: 10003;
                }

                .hb-modal {
                    background-color: #2a2a2a;
                    color: white;
                    border: 2px solid #555;
                    border-radius: 10px;
                    width: 90%;
                    max-width: 520px;
                    padding: 16px;
                    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.6);
                }

                .hb-modal-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 12px;
                }

                .hb-modal-header h4 {
                    margin: 0;
                }

                .hb-modal-body {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    font-size: 12px;
                    color: #ccc;
                }

                #notice-message {
                    white-space: pre-line;
                }

                .hb-modal-warning {
                    color: #ccc;
                }

                .hb-modal-actions {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    margin-top: 14px;
                }

                .hb-modal-actions.right {
                    justify-content: flex-end;
                }

                .hb-hidden {
                    display: none;
                }

                .category-controls {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 15px;
                }

                .category-checkboxes {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    max-height: 200px;
                    overflow-y: auto;
                }

                .category-checkbox-row {
                    display: flex;
                    align-items: center;
                }

                .category-checkbox-label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                    color: #ccc;
                    cursor: pointer;
                    width: 100%;
                    font-weight: normal;
                }

                .category-checkbox {
                    margin: 0;
                    cursor: pointer;
                }

                .category-name {
                    flex-grow: 1;
                    font-weight: normal;
                }

                .category-checkbox-label:hover .category-name {
                    color: white;
                }

                .everything-blocked-message {
                    text-align: center;
                    padding: 40px 20px;
                    color: #dc3545;
                    font-size: 16px;
                    background-color: rgba(220, 53, 69, 0.1);
                    border: 2px dashed #dc3545;
                    border-radius: 8px;
                    margin: 20px 0;
                    display: none;
                }

                .everything-blocked-message .subtitle {
                    font-size: 14px;
                    color: #666;
                    margin-top: 8px;
                }
            `;
            document.head.appendChild(style);
        },

        /**
         * Create main GUI container
         */
        createGUIContainer() {
            this.guiContainer = document.createElement('div');
            this.guiContainer.id = SELECTORS.GUI_CONTAINER;
            this.guiContainer.style.cssText = `
                position: fixed;
                top: 5vh;
                left: 50%;
                transform: translateX(-50%);
                background-color: #333;
                color: white;
                padding: 20px;
                z-index: 10000;
                border: 2px solid #ccc;
                border-radius: 10px;
                display: none;
                height: 90vh;
                max-width: 95vw;
                overflow-y: auto;
                flex-direction: column;
            `;

            this.guiContainer.innerHTML = this.getGUIHTML();
            document.body.appendChild(this.guiContainer);
            this.updateContainerWidth();
        },

        /**
         * Update container width based on screen size - narrower design
         */
        updateContainerWidth() {
            if (!this.guiContainer) return;
            const screenWidth = window.innerWidth;

            if (screenWidth < 1200) {
                this.guiContainer.style.width = '80vw';
            } else {
                this.guiContainer.style.width = '50vw';
            }
        },

        /**
         * Get HTML content for GUI
         * @returns {string} HTML content
         */
        getGUIHTML() {
            return `
                <div class="side-by-side">
                    <div>
                        <div class="section-header">
                            <div class="section-title">
                                <h3>Highlight</h3>
                                <button class="help-icon" id="help-btn" title="Click for help">?</button>
                            </div>
                        </div>
                        <div class="keyword-input">
                            <p>Must contain:</p>
                            <div id="highlight-keyword-container"></div>
                            <p>But not if it contains:</p>
                            <div id="highlight-exception-container"></div>
                            <div class="button-group filter-row">
                                <button id="add-keyword-highlight-btn" class="action-button">Add Highlight Rule</button>
                                <div class="filter-inline">
                                    <label class="filter-chip">
                                        <input type="checkbox" id="show-auto-rules" ${AppState.showAutoRules ? 'checked' : ''}>
                                        <span>Auto</span>
                                    </label>
                                    <label class="filter-chip">
                                        <input type="checkbox" id="show-manual-rules" ${AppState.showManualRules ? 'checked' : ''}>
                                        <span>Manual</span>
                                    </label>
                                </div>
                            </div>
                            <div id="highlight-validation-error" class="validation-error"></div>
                        </div>
                        <ul id="keywords-highlight-list" class="rule-list"></ul>
                    </div>
                    <div>
                        <div class="section-header">
                            <div class="section-title">
                                <h3>Block</h3>
                            </div>
                            <div class="top-right-controls">
                                <div class="toggle-container">
                                    <span class="toggle-label">Enable:</span>
                                    <label class="switch">
                                        <input type="checkbox" id="toggle-highlight-block-switch" ${AppState.isEnabled ? 'checked' : ''}>
                                        <span class="slider"></span>
                                    </label>
                                </div>
                                <button class="settings-cog" id="settings-btn" title="Settings">⚙</button>
                                <button class="close-x" id="close-x-btn" title="Close">×</button>
                            </div>
                        </div>
                        <div class="keyword-input">
                            <p>Must contain:</label>
                            <div id="block-keyword-container"></div>
                            <p>But not if it contains:</p>
                            <div id="block-exception-container"></div>
                            <div class="button-group">
                                <button id="add-keyword-block-btn" class="action-button">Add Block Rule</button>
                            </div>
                            <div id="block-validation-error" class="validation-error"></div>
                        </div>
                        <ul id="keywords-block-list" class="rule-list"></ul>
                    </div>
                </div>

                <div class="settings-overlay" id="settings-overlay">
                    <div class="settings-header">
                        <h3>Settings</h3>
                        <button class="close-x" id="settings-close-btn" title="Close">×</button>
                    </div>

                    <div class="settings-content">
                            <div class="settings-section">
                            <h4>Highlight Colors</h4>
                            <div class="color-picker-row">
                                <label class="toggle-label">Light mode color:</label>
                                <input type="color" id="light-color-picker" value="${AppState.colors.light}" class="color-picker">
                                <button id="reset-light-color" class="reset-color-btn" title="Reset to default">↺</button>
                            </div>
                            <div class="color-picker-row">
                                <label class="toggle-label">Dark mode color:</label>
                                <input type="color" id="dark-color-picker" value="${AppState.colors.dark}" class="color-picker">
                                <button id="reset-dark-color" class="reset-color-btn" title="Reset to default">↺</button>
                            </div>
                        </div>

                        ${!isSukebei ? `
                        <div class="settings-section">
                            <h4>Auto-Import Rules</h4>
                            <div class="settings-buttons column-left">
                                <div class="toggle-container">
                                    <span class="toggle-label">Auto-highlight fansubbers:</span>
                                    <label class="switch">
                                        <input type="checkbox" id="fansubbers-toggle" ${AppState.fansubbersToggle ? 'checked' : ''}>
                                        <span class="slider"></span>
                                    </label>
                                </div>
                                <div class="toggle-container">
                                    <span class="toggle-label">Auto-block minis:</span>
                                    <label class="switch">
                                        <input type="checkbox" id="minis-toggle" ${AppState.minisToggle ? 'checked' : ''}>
                                        <span class="slider"></span>
                                    </label>
                                </div>
                            </div>
                            <div class="blacklist-description">
                                If you remove rules from the auto-highlight list or the auto-block list,
                                the below blacklists will populate so the rules are not re-added in the future.
                                If you change your mind, removing a rule from the blacklist will add it back to your highlight/block rules.
                            </div>
                            <div class="button-group">
                                <button id="toggle-blacklists-btn" class="action-button">Show Blacklists</button>
                            </div>
                            <div class="blacklist-section" id="blacklist-section" style="display: none;">
                                <div class="blacklist-group">
                                    <div class="blacklist-label">Fansubbers blacklist</div>
                                    <ul id="fansubbers-blacklist-list" class="rule-list"></ul>
                                </div>
                                <div class="blacklist-group">
                                    <div class="blacklist-label">Minis blacklist</div>
                                    <ul id="minis-blacklist-list" class="rule-list"></ul>
                                </div>
                            </div>
                        </div>
                        ` : ''}

                        <div class="settings-section">
                            <h4>Block Categories</h4>
                            <div class="category-controls">
                                <button id="select-all-categories" class="action-button">Select All</button>
                                <button id="select-none-categories" class="action-button">Select None</button>
                            </div>
                            <div class="category-checkboxes">
                                ${Object.entries(CATEGORIES).map(([key, label]) => `
                                    <div class="category-checkbox-row">
                                        <label class="category-checkbox-label">
                                            <input type="checkbox" class="category-checkbox" data-category="${key}" ${AppState.blockedCategories.includes(key) ? 'checked' : ''}>
                                            <span class="category-name">${label}</span>
                                        </label>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <div class="settings-section">
                            <h4>Custom Import/Export</h4>
                            <div class="settings-buttons">
                                <button id="import-btn" class="action-button" title="Import configuration from file">Import Configuration</button>
                                <button id="export-btn" class="action-button" title="Export configuration to file">Export Configuration</button>
                            </div>
                        </div>

                        <div class="settings-section">
                            <h4>Reset Settings</h4>
                            <div class="settings-buttons">
                                <button id="reset-to-defaults-btn" class="action-button danger" title="Reset all settings to their original defaults">Reset to Default Settings</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="hb-modal-overlay" id="import-mode-modal">
                    <div class="hb-modal">
                        <div class="hb-modal-header">
                            <h4>Import Configuration</h4>
                            <button class="close-x" id="import-mode-close" title="Close">&times;</button>
                        </div>
                        <div class="hb-modal-body">
                            <div>Choose how you want to import your settings:</div>
                            <div><strong>Merge:</strong> Import only the Highlight and Block rules. These will be ADDED to your rules, rather than replacing.</div>
                            <div class="hb-modal-warning"><strong>Override:</strong> Replace EVERYTHING. This will delete and replace all of your Highlight and Block rules, as well as your settings.</div>
                        </div>
                        <div class="hb-modal-actions">
                            <button id="import-mode-merge" class="action-button">Merge</button>
                            <button id="import-mode-override" class="action-button danger">Override</button>
                            <button id="import-mode-cancel" class="action-button">Cancel</button>
                        </div>
                    </div>
                </div>

                <div class="hb-modal-overlay" id="import-confirm-modal">
                    <div class="hb-modal">
                        <div class="hb-modal-header">
                            <h4>Confirm Import</h4>
                            <button class="close-x" id="import-confirm-close" title="Close">&times;</button>
                        </div>
                        <div class="hb-modal-body">
                            <div id="import-confirm-summary"></div>
                            <div id="import-confirm-warning" class="hb-modal-warning"></div>
                            <div>This action cannot be undone.</div>
                        </div>
                        <div class="hb-modal-actions">
                            <button id="import-confirm-yes" class="action-button danger">Confirm</button>
                            <button id="import-confirm-no" class="action-button">Cancel</button>
                        </div>
                    </div>
                </div>

                <div class="hb-modal-overlay" id="notice-modal">
                    <div class="hb-modal">
                        <div class="hb-modal-header">
                            <h4 id="notice-title">Notice</h4>
                            <button class="close-x" id="notice-close" title="Close">&times;</button>
                        </div>
                        <div class="hb-modal-body">
                            <div id="notice-message"></div>
                        </div>
                        <div class="hb-modal-actions right">
                            <button id="notice-ok" class="action-button">OK</button>
                            <button id="notice-cancel" class="action-button hb-hidden">Cancel</button>
                        </div>
                    </div>
                </div>

                <div class="help-popup" id="help-popup">
                    <button class="help-close" id="help-close">×</button>
                    <h3>How to Use This Tool</h3>

                    <p>What This Tool Does:</p>
                    <ul>
                        <li>Highlight: Makes matching titles stand out with a highlighted background</li>
                        <li>Block: Completely hides matching titles from view</li>
                    </ul>

                    <p>How to Create a Rule:</p>
                    <ul>
                        <li>Type each word or phrase and press "Enter" to create a separate "chip"</li>
                        <li>You can click on any chip to edit it</li>
                        <li>Click the × on any chip to remove it</li>
                    </ul>

                    <p>How Rule Logic Works:</p>
                    <ul>
                        <li>Must contain: ALL words/phrases must be found in a title (uses AND logic)</li>
                        <li>But not if it contains: If ANY of these words/phrases are found, the rule won't apply (uses OR logic)</li>
                        <li>Note: Non-latin characters are (hopefully) fully supported. This includes spaces, meaning you could do things like blocking "CR WEB-DL AVC" if so desired</li>
                        <li>Note: Matching is case-insensitive ("SubsPlease" is the same as "subsplease")</li>
                    </ul>

                    <p>Example:</p>
                    <ul>
                        <li>If you wanted to highlight all 1080p SubsPlease releases except for unofficial batches, you could configure it under the Highlight section as:</li>
                        <li class="help-list-item spaced">
                            Must contain:
                            <span class="colored-chip green-chip">SubsPlease</span>
                            <span class="colored-chip green-chip">1080p</span>
                        </li>
                        <li class="help-list-item">
                            But not if it contains:
                            <span class="colored-chip red-chip">Unofficial Batch</span>
                        </li>
                        <li>If you wanted to block all VARYG releases except for Netflix, Amazon, or Disney+ (i.e. block all of VARYG's Crunchyroll and Hidive releases), you could configure it under the Block section as:</li>
                        <li class="help-list-item spaced">
                            Must contain:
                            <span class="colored-chip green-chip">VARYG</span>
                        </li>
                        <li class="help-list-item">
                            But not if it contains:
                            <span class="colored-chip red-chip">NF</span>
                            <span class="colored-chip red-chip">AMZN</span>
                            <span class="colored-chip red-chip">DSNP</span>
                        </li>
                    </ul>

                    <p>Further settings:</p>
                    <ul>
                        <li>The "Enable" toggle in the top right turns the entire script on or off</li>
                        <li>Click the "⚙" (gear icon) in the top right, next to the close button, to access the following additional settings:</li>
                        <li class="help-list-item spaced">Highlight Colors: Customize the highlight colors for both light and dark themes</li>
                        <li class="help-list-item spaced">Auto-Import Rules: Instantly highlight common fansubber groups or block mini release groups, and receive automatic updates. Undesired groups can be removed</li>
                        <li class="help-list-item spaced">Block Categories: Block undesired categories (e.g. "Anime - Anime Music Video") when browsing the homepage or a category group. If you navigate directly to a category (e.g. filter specifically to show only "Anime - Anime Music Video"), it will not be hidden</li>
                        <li class="help-list-item spaced">Custom Import/Export: Save your rules to a file for sharing or backup, or load previously saved configurations. On import you can choose to override all settings or only merge rules</li>
                        <li class="help-list-item spaced">Reset Settings: Restart from scratch. Will reset all configured highlights, blocks, and other settings. Consider exporting your configuration before performing a reset</li>
                    </ul>
                </div>

            `;
        },

        /**
         * Create navbar button
         */
        createOpenButton() {
            // Add button to main navbar (left side)
            const navbar = document.querySelector(".navbar-nav");
            if (navbar) {
                const settingsItem = document.createElement("li");
                const settingsLink = document.createElement("a");
                settingsLink.innerHTML = ' <i class="fa fa-filter fa-fw" aria-hidden="true"></i>H&B';
                settingsLink.title = "Highlight & Block Settings";
                settingsLink.style.cursor = "pointer";
                settingsLink.id = "highlight-block-link";
                settingsLink.addEventListener("click", (e) => {
                    e.preventDefault();
                    this.toggleGUI();
                });
                settingsItem.appendChild(settingsLink);
                navbar.appendChild(settingsItem);

                this.openButton = settingsLink; // Store reference for event handling
            }
        },

        /**
         * Bind event listeners
         */
        bindEvents() {
            // Window resize handler
            window.addEventListener('resize', () => {
                this.updateContainerWidth();
                this.syncListHeights();
            });

            // Document click handler for closing GUI
            document.addEventListener('click', (event) => {
                this.handleDocumentClick(event);
            });

            // Initialize button event listeners after DOM is ready
            setTimeout(() => {
                this.bindButtonEvents();
            }, 100);
        },

        /**
         * Toggle GUI visibility
         */
        toggleGUI() {
            const isVisible = this.guiContainer.style.display === 'flex';
            this.guiContainer.style.display = isVisible ? 'none' : 'flex';

            if (!isVisible && !this.chipInputs) {
                this.initializeChipInputs();
            }

            if (!isVisible) {
                this.syncListHeights();
            }
        },

        /**
         * Handle document click events
         * @param {Event} event - Click event
         */
        handleDocumentClick(event) {
            // Don't close if clicking on chip remove buttons
            if (event.target.classList.contains('chip-remove')) {
                return;
            }

            // Don't close if clicking on cancel edit buttons
            if (event.target.id === 'highlight-cancel-container' ||
                event.target.id === 'block-cancel-container') {
                return;
            }

            // Close GUI if clicking outside
            if (!this.guiContainer.contains(event.target) &&
                this.openButton && !this.openButton.contains(event.target)) {
                this.guiContainer.style.display = 'none';
            }
        },

        /**
         * Bind button event listeners
         */
        bindButtonEvents() {
            const highlightBtn = document.getElementById('add-keyword-highlight-btn');
            const blockBtn = document.getElementById('add-keyword-block-btn');
            const closeBtn = document.getElementById('close-x-btn');

            if (highlightBtn) {
                highlightBtn.addEventListener('click', addKeywordToHighlight);
            }

            if (blockBtn) {
                blockBtn.addEventListener('click', addKeywordToBlock);
            }

            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.guiContainer.style.display = 'none';
                });
            }

            const helpBtn = document.getElementById('help-btn');
            const helpClose = document.getElementById('help-close');
            const helpPopup = document.getElementById('help-popup');

            if (helpBtn) {
                helpBtn.addEventListener('click', () => {
                    if (helpPopup.style.display === 'block') {
                        helpPopup.style.display = 'none';
                    } else {
                        helpPopup.style.display = 'block';
                    }
                });
            }

            if (helpClose) {
                helpClose.addEventListener('click', () => {
                    helpPopup.style.display = 'none';
                });
            }

            // Close help popup when clicking outside
            if (helpPopup) {
                document.addEventListener('click', (event) => {
                    if (!helpPopup.contains(event.target) && !helpBtn.contains(event.target)) {
                        helpPopup.style.display = 'none';
                    }
                });
            }

            const toggleSwitch = document.getElementById('toggle-highlight-block-switch');

            if (toggleSwitch) {
                toggleSwitch.addEventListener('change', (event) => {
                    AppState.isEnabled = event.target.checked;
                    AppState.saveEnabledState();
                    updateDisplay();
                });
            }

            const importBtn = document.getElementById('import-btn');
            const exportBtn = document.getElementById('export-btn');

            if (importBtn) {
                importBtn.addEventListener('click', importConfiguration);
            }

            if (exportBtn) {
                exportBtn.addEventListener('click', exportConfiguration);
            }

            // Toggle event listeners
            const fansubbersToggle = document.getElementById('fansubbers-toggle');
            const minisToggle = document.getElementById('minis-toggle');

            if (fansubbersToggle) {
                fansubbersToggle.addEventListener('change', (event) => {
                    AppState.fansubbersToggle = event.target.checked;
                    AppState.saveToggleStates();
                    if (AppState.fansubbersToggle) {
                        autoImportFansubbers();
                        updateRuleLists();
                        updateDisplay();
                        return;
                    }

                    openNoticeModal({
                        title: 'Auto-Highlight Disabled',
                        message:
                            'Do you want to remove all auto-imported fansubber rules from Highlights?\n' +
                            'This will only remove rules that match the preset list.',
                        showCancel: true,
                        okText: 'Yes',
                        cancelText: 'No'
                    }).then((confirmed) => {
                        if (!confirmed) return;
                        AppState.keywordsHighlight = AppState.keywordsHighlight.filter(([k, e]) =>
                            !isPresetRuleForType('highlight', k, e)
                        );
                        AppState.saveHighlightKeywords();
                        updateRuleLists();
                        updateDisplay();
                    });
                });
            }

            if (minisToggle) {
                minisToggle.addEventListener('change', (event) => {
                    AppState.minisToggle = event.target.checked;
                    AppState.saveToggleStates();
                    if (AppState.minisToggle) {
                        autoImportMinis();
                        updateRuleLists();
                        updateDisplay();
                        return;
                    }

                    openNoticeModal({
                        title: 'Auto-Block Disabled',
                        message:
                            'Do you want to remove all auto-imported mini rules from Blocks?\n' +
                            'This will only remove rules that match the preset list.',
                        showCancel: true,
                        okText: 'Yes',
                        cancelText: 'No'
                    }).then((confirmed) => {
                        if (!confirmed) return;
                        AppState.keywordsBlock = AppState.keywordsBlock.filter(([k, e]) =>
                            !isPresetRuleForType('block', k, e)
                        );
                        AppState.saveBlockKeywords();
                        updateRuleLists();
                        updateDisplay();
                    });
                });
            }


            const lightColorPicker = document.getElementById('light-color-picker');
            const darkColorPicker = document.getElementById('dark-color-picker');
            const resetLightBtn = document.getElementById('reset-light-color');
            const resetDarkBtn = document.getElementById('reset-dark-color');

            if (lightColorPicker) {
                lightColorPicker.addEventListener('click', () => {
                    const guiContainer = document.getElementById('guiContainer');
                    const settingsOverlay = document.getElementById('settings-overlay');
                    if (guiContainer) guiContainer.style.display = 'none';
                    if (settingsOverlay) settingsOverlay.style.display = 'none';
                });
                lightColorPicker.addEventListener('input', handleLightColorChange);
                lightColorPicker.addEventListener('change', handleLightColorChange);
            }

            if (darkColorPicker) {
                darkColorPicker.addEventListener('click', () => {
                    const guiContainer = document.getElementById('guiContainer');
                    const settingsOverlay = document.getElementById('settings-overlay');
                    if (guiContainer) guiContainer.style.display = 'none';
                    if (settingsOverlay) settingsOverlay.style.display = 'none';
                });
                darkColorPicker.addEventListener('input', handleDarkColorChange);
                darkColorPicker.addEventListener('change', handleDarkColorChange);
            }

            if (resetLightBtn) {
                resetLightBtn.addEventListener('click', resetLightColor);
            }

            if (resetDarkBtn) {
                resetDarkBtn.addEventListener('click', resetDarkColor);
            }

            // Settings button
            const settingsBtn = document.getElementById('settings-btn');
            const settingsCloseBtn = document.getElementById('settings-close-btn');
            const settingsOverlay = document.getElementById('settings-overlay');

            if (settingsBtn) {
                settingsBtn.addEventListener('click', () => {
                    if (settingsOverlay.style.display === 'block') {
                        settingsOverlay.style.display = 'none';
                    } else {
                        settingsOverlay.style.display = 'block';
                    }
                });
            }

            if (settingsCloseBtn) {
                settingsCloseBtn.addEventListener('click', () => {
                    settingsOverlay.style.display = 'none';
                    document.body.classList.remove('color-picker-active');
                });
            }

            // Close settings when clicking outside
            document.addEventListener('click', (event) => {
                if (settingsOverlay &&
                    settingsOverlay.style.display === 'block' &&
                    !settingsOverlay.contains(event.target) &&
                    !settingsBtn.contains(event.target)) {
                    settingsOverlay.style.display = 'none';
                    document.body.classList.remove('color-picker-active');
                }
            });

            // Category checkbox event listeners
            const categoryCheckboxes = document.querySelectorAll('.category-checkbox');
            categoryCheckboxes.forEach(checkbox => {
                checkbox.addEventListener('change', (event) => {
                    const category = event.target.dataset.category;
                    if (event.target.checked) {
                        if (!AppState.blockedCategories.includes(category)) {
                            AppState.blockedCategories.push(category);
                        }
                    } else {
                        const index = AppState.blockedCategories.indexOf(category);
                        if (index > -1) {
                            AppState.blockedCategories.splice(index, 1);
                        }
                    }
                    AppState.saveBlockedCategories();
                    updateDisplay();
                });
            });

            // Select all categories button
            const selectAllBtn = document.getElementById('select-all-categories');
            if (selectAllBtn) {
                selectAllBtn.addEventListener('click', () => {
                    AppState.blockedCategories = Object.keys(CATEGORIES);
                    AppState.saveBlockedCategories();

                    // Update all checkboxes
                    categoryCheckboxes.forEach(checkbox => {
                        checkbox.checked = true;
                    });

                    updateDisplay();
                });
            }

            // Select none categories button
            const selectNoneBtn = document.getElementById('select-none-categories');
            if (selectNoneBtn) {
                selectNoneBtn.addEventListener('click', () => {
                    AppState.blockedCategories = [];
                    AppState.saveBlockedCategories();

                    // Update all checkboxes
                    categoryCheckboxes.forEach(checkbox => {
                        checkbox.checked = false;
                    });

                    updateDisplay();
                });
            }

            // Reset to defaults button
            const resetBtn = document.getElementById('reset-to-defaults-btn');
            if (resetBtn) {
                resetBtn.addEventListener('click', resetToDefaultSettings);
            }

            const toggleBlacklistsBtn = document.getElementById('toggle-blacklists-btn');
            const blacklistSection = document.getElementById('blacklist-section');
            if (toggleBlacklistsBtn && blacklistSection) {
                toggleBlacklistsBtn.addEventListener('click', (event) => {
                    event.preventDefault();
                    const isHidden = blacklistSection.style.display === 'none';
                    blacklistSection.style.display = isHidden ? 'flex' : 'none';
                    toggleBlacklistsBtn.textContent = isHidden ? 'Hide Blacklists' : 'Show Blacklists';
                });
            }

            const showAutoCheckbox = document.getElementById('show-auto-rules');
            const showManualCheckbox = document.getElementById('show-manual-rules');
            if (showAutoCheckbox) {
                showAutoCheckbox.addEventListener('change', (event) => {
                    AppState.showAutoRules = event.target.checked;
                    AppState.saveRuleFilters();
                    updateRuleLists();
                });
            }
            if (showManualCheckbox) {
                showManualCheckbox.addEventListener('change', (event) => {
                    AppState.showManualRules = event.target.checked;
                    AppState.saveRuleFilters();
                    updateRuleLists();
                });
            }

            updateRuleLists();
            updateDisplay();
        },

        /**
         * Initialize chip input components
         */
        initializeChipInputs() {
            this.chipInputs = {
                highlightKeyword: new ChipInput('highlight-keyword-container', 'Add word or phrase to highlight'),
                highlightException: new ChipInput('highlight-exception-container', 'Add word or phrase to exclude from highlight'),
                blockKeyword: new ChipInput('block-keyword-container', 'Add word or phrase to block'),
                blockException: new ChipInput('block-exception-container', 'Add word or phrase to exclude from block')
            };
        },

        /**
         * Synchronize list heights for better visual balance
         */
        syncListHeights() {
            const highlightList = document.getElementById('keywords-highlight-list');
            const blockList = document.getElementById('keywords-block-list');

            if (!highlightList || !blockList) return;

            // Reset heights
            highlightList.style.height = 'auto';
            blockList.style.height = 'auto';

            // Get natural heights
            const highlightHeight = highlightList.offsetHeight;
            const blockHeight = blockList.offsetHeight;

            // Set both to the maximum height
            const maxHeight = Math.max(highlightHeight, blockHeight);
            highlightList.style.height = `${maxHeight}px`;
            blockList.style.height = `${maxHeight}px`;
        }
    };

    // ============================================================================
    // RULE LIST MANAGEMENT
    // ============================================================================

    /**
     * Update both rule lists
     */
    const updateRuleLists = () => {
        updateHighlightRuleList();
        updateBlockRuleList();
        updateBlacklistLists();
        UI.syncListHeights();
    };

    /**
     * Update highlight rules list display
     */
    const updateHighlightRuleList = () => {
        const list = document.getElementById('keywords-highlight-list');
        if (!list) return;

        list.innerHTML = '';

        AppState.keywordsHighlight.forEach(([keywordParts, exceptionParts], index) => {
            const isAuto = isPresetRuleForType('highlight', keywordParts, exceptionParts);
            if ((!AppState.showAutoRules && isAuto) || (!AppState.showManualRules && !isAuto)) {
                return;
            }
            const listItem = createRuleListItem('highlight', index, keywordParts, exceptionParts);
            list.appendChild(listItem);
        });
    };

    /**
     * Update block rules list display
     */
    const updateBlockRuleList = () => {
        const list = document.getElementById('keywords-block-list');
        if (!list) return;

        list.innerHTML = '';

        AppState.keywordsBlock.forEach(([keywordParts, exceptionParts], index) => {
            const isAuto = isPresetRuleForType('block', keywordParts, exceptionParts);
            if ((!AppState.showAutoRules && isAuto) || (!AppState.showManualRules && !isAuto)) {
                return;
            }
            const listItem = createRuleListItem('block', index, keywordParts, exceptionParts);
            list.appendChild(listItem);
        });
    };

    /**
     * Update both blacklist lists
     */
    const updateBlacklistLists = () => {
        updateBlacklistList('fansubbers');
        updateBlacklistList('minis');
    };

    /**
     * Update a blacklist list display
     * @param {string} type - 'fansubbers' or 'minis'
     */
    const updateBlacklistList = (type) => {
        const list = document.getElementById(`${type}-blacklist-list`);
        if (!list) return;

        list.innerHTML = '';

        const rules = type === 'fansubbers' ? AppState.fansubbersBlacklist : AppState.minisBlacklist;
        if (rules.length > 1) {
            sortRules(rules);
            AppState.saveBlacklists();
        }
        rules.forEach(([keywordParts, exceptionParts], index) => {
            const listItem = createBlacklistListItem(type, index, keywordParts, exceptionParts);
            list.appendChild(listItem);
        });
    };

    /**
     * Create a blacklist list item element
     * @param {string} type - 'fansubbers' or 'minis'
     * @param {number} index - Rule index
     * @param {Array} keywordParts - Keyword parts array
     * @param {Array} exceptionParts - Exception parts array
     * @returns {Element} List item element
     */
    const createBlacklistListItem = (type, index, keywordParts, exceptionParts) => {
        const keywordChips = keywordParts
            .filter(k => k && k.trim())
            .map(k => `<span class="colored-chip green-chip">${sanitizeInput(k)}</span>`)
            .join('');

        const exceptionChips = exceptionParts
            .filter(e => e && e.trim())
            .map(e => `<span class="colored-chip red-chip">${sanitizeInput(e)}</span>`)
            .join('');

        const li = document.createElement('li');
        li.className = 'rule-item';

        li.innerHTML = `
            <div class="rule-buttons">
                <div class="button-group">
                    <button class="action-button rule-button blacklist-remove-btn"
                            data-type="${type}"
                            data-index="${index}">
                        Remove
                    </button>
                </div>
            </div>
            <div class="rule-content">
                ${keywordChips}
                ${exceptionChips}
            </div>
        `;

        const removeBtn = li.querySelector('.blacklist-remove-btn');
        if (removeBtn) {
            removeBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                const idx = parseInt(removeBtn.dataset.index);
                const ruleType = removeBtn.dataset.type;
                removeBlacklistRule(ruleType, idx);
            });
        }

        return li;
    };

    /**
     * Create a rule list item element
     * @param {string} type - 'highlight' or 'block'
     * @param {number} index - Rule index
     * @param {Array} keywordParts - Keyword parts array
     * @param {Array} exceptionParts - Exception parts array
     * @returns {Element} List item element
     */
    const createRuleListItem = (type, index, keywordParts, exceptionParts) => {
        const isEditing = AppState.editMode.isEditing &&
            AppState.editMode.type === type &&
            AppState.editMode.index === index;

        const keywordChips = keywordParts
            .filter(k => k && k.trim())
            .map(k => `<span class="colored-chip green-chip">${sanitizeInput(k)}</span>`)
            .join('');

        const exceptionChips = exceptionParts
            .filter(e => e && e.trim())
            .map(e => `<span class="colored-chip red-chip">${sanitizeInput(e)}</span>`)
            .join('');

        const presetBadge = isPresetRuleForType(type, keywordParts, exceptionParts)
            ? `<span class="auto-badge">Auto</span>`
            : '';

        const li = document.createElement('li');
        li.className = `rule-item ${isEditing ? 'editing' : ''}`;

        li.innerHTML = `
            <div class="rule-buttons">
                <div class="button-group">
                    <button class="${type}-edit-btn action-button rule-button"
                            data-index="${index}"
                            ${isEditing ? 'disabled' : ''}>
                        ${isEditing ? 'Editing...' : 'Edit'}
                    </button>
                    <button class="${type}-remove-btn action-button rule-button"
                            data-index="${index}"
                            ${isEditing ? 'disabled' : ''}>
                        Remove
                    </button>
                </div>
            </div>
            <div class="rule-content">
                ${keywordChips}
                ${exceptionChips}
                ${presetBadge}
            </div>
        `;

        // Bind event listeners
        bindRuleItemEvents(li, type);

        return li;
    };

    /**
     * Bind event listeners for rule item buttons
     * @param {Element} listItem - List item element
     * @param {string} type - 'highlight' or 'block'
     */
    const bindRuleItemEvents = (listItem, type) => {
        const editBtn = listItem.querySelector(`.${type}-edit-btn`);
        const removeBtn = listItem.querySelector(`.${type}-remove-btn`);

        if (editBtn) {
            editBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                if (!editBtn.disabled) {
                    const index = parseInt(editBtn.dataset.index);
                    enterEditMode(type, index);
                }
            });
        }

        if (removeBtn) {
            removeBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                if (!removeBtn.disabled) {
                    const index = parseInt(removeBtn.dataset.index);
                    removeRule(type, index);
                }
            });
        }
    };

    // ============================================================================
    // INITIALIZATION
    // ============================================================================

    /**
     * Initialize the application
     */
    const init = () => {
        try {
            UI.init();

            // Auto-import on startup if toggles are enabled
            autoImportFansubbers();
            autoImportMinis();

            updateDisplay();
            initThemeAndNyaaBlueMonitoring();
        } catch (error) {
            console.error('Failed to initialize Nyaa Highlight & Block script:', error);
        }
    };


    // Start the application when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
