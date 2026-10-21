// ==UserScript==
// @name         Nyaa - Highlight & Block
// @version      1.26
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

    // Configuration

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
            COMMENT_RESCUE_ENABLED: 'commentRescueEnabled',
            COMMENT_HIGHLIGHT_ENABLED: 'commentHighlightEnabled',
            COMMENT_RESCUE_THRESHOLD: 'commentRescueThreshold',
            SHOW_AUTO_RULES: 'showAutoRules',
            SHOW_MANUAL_RULES: 'showManualRules',
            AUTO_IMPORTED_HIGHLIGHT: isSukebei ? 'autoImportedHighlight_sukebei' : 'autoImportedHighlight',
            AUTO_IMPORTED_BLOCK: isSukebei ? 'autoImportedBlock_sukebei' : 'autoImportedBlock',
            LAST_SEEN_ANNOUNCEMENT: 'lastSeenUpdateAnnouncement'
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
            ],
            COMMENT_RESCUE_ENABLED: true,
            COMMENT_HIGHLIGHT_ENABLED: true,
            COMMENT_RESCUE_THRESHOLD: 5
        },
        DEBOUNCE_DELAY: 100
    };

    // Replace these details and increase the ID by 1 for each new announcement.
    // settingsTargetId and settingsLinkText are optional.
    const LATEST_UPDATE_ANNOUNCEMENT = {
        id: 1,
        title: 'Gossip Monitor',
        message:
            'Make popular discussions easier to find. Highlight torrents with a high number of comments and/or exempt them from blocking.',
        settingsTargetId: 'gossip-settings',
        settingsLinkText: 'Open Gossip Settings'
    };

    const PRESETS = {
        FANSUBBERS: [
            [["[9volt]"], []],
            [["[Animorphs]"], []],
            [["[Arid]"], []],
            [["[Asakura]"], []],
            [["[Baws]"], []],
            [["[BlackRose]"], []],
            [["[Blasphemboys]"], []],
            [["[BlurayDesuYo]"], []],
            [["[Cait-Sidhe]"], []],
            [["[cappybara]"], []],
            [["[chasa]"], []],
            [["[Chihiro]"], []],
            [["[Commie]"], []],
            [["[CrappySubs]"], []],
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
            [["[KawaSubs]"], []],
            [["[Kawatare]"], []],
            [["[Lazyleido]"], []],
            [["[LG]"], []],
            [["[LonelyChaser]"], []],
            [["[MaruChanSubs]"], []],
            [["[McBalls]"], []],
            [["[Mocha]"], []],
            [["[mSubs]"], []],
            [["[MTBB]"], []],
            [["[Noiy]"], []],
            [["[Ny]"], []],
            [["[Okay-Raws]"], []],
            [["[Okay-Subs]"], []],
            [["[Orphan]"], []],
            [["[P9]"], []],
            [["[Paradise]"], []],
            [["[Perevodildo]"], []],
            [["[Piyoko]"], []],
            [["[Pizza]"], []],
            [["[poop]"], []],
            [["[RedKite]"], []],
            [["[Reza]"], []],
            [["[Saizen]"], []],
            [["[sam]"], []],
            [["[Seigyoku]"], []],
            [["(shiteater)"], []],
            [["[Some-Stuffs]"], ["Pocket Monsters", "Poké"]], // Exclude pokemon due to volume that probably isn't relevant to most
            [["[sgt]"], []],
            [["[Starbez]"], []],
            [["[Stardust]"], []],
            [["[SubsWhen]"], []],
            [["[Vodes]"], []],
            [["[WakuTomete]"], []],
            [["[WastedChaser]"], []],
            [["[WasteOfBlindness]"], []],
            [["[washed]"], []],
            [["[whomst]"], []]
        ],
        MINIS: [
            [["[Anime Time]"], []],
            [["[AnimeAlpha]"], []],
            [["[Animorphs-mini]"], []],
            [["[ARR]"], []],
            [["[ASW]"], []],
            [["AV1"], ["[WOR]"]],
            [["[DB]"], []],
            [["[DKB]"], []],
            [["[EMBER]"], []],
            [["[Erai-raws]", "WEBRip"], []],
            [["[Feibanyama]"], []],
            [["[GERmini]"], []],
            [["[HGS]"], []],
            [["[HGS-R]"], []],
            [["[HGS-Renc]"], []],
            [["[JacobSwaggedUp]"], []],
            [["[Judas]"], []],
            [["[Kotobuki]"], []],
            [["[MiniMTBB]"], []],
            [["[Mo7tas]"], []],
            [["[neoDESU]"], []],
            [["[neoHEVC]"], []],
            [["Rapta"], []],
            [["[Tenrai-Sensei]"], []],
            [["[torta]"], []],
            [["[TRC]"], []],
            [["[whomst-mini]"], []]
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

    // Predicate helpers

    const Chips = {
        from: (value) => new ChipChain(value),
        all: (predicates) => (value) => predicates.every(pred => pred(value)),
        any: (predicates) => (value) => predicates.some(pred => pred(value)),
        contains: (keyword) => (text) => text.toLowerCase().includes(keyword.toLowerCase()),
        not: (predicate) => (value) => !predicate(value)
    };

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

            let result;
            this.operations.forEach(({ type, op }, index) => {
                const operationResult = type === 'not' ? !op(this.value) : op(this.value);

                if (index === 0) {
                    result = operationResult;
                    return;
                }

                switch (type) {
                    case 'and':
                    case 'not':
                        result = result && operationResult;
                        break;
                    case 'or':
                        result = result || operationResult;
                        break;
                }
            });

            return result;
        }

        result() {
            return this.execute();
        }
    }

    // Utilities

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

    // Normalize chip input while preserving literal characters. Rendering uses
    // text nodes or HTML escaping, so rule text does not need destructive cleanup.
    const normalizeChipInput = (text) => {
        if (typeof text !== 'string') return '';
        return text.trim();
    };

    const escapeHtml = (text) => String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const cloneValue = (value) => JSON.parse(JSON.stringify(value));

    const STORAGE_SCOPE = isSukebei ? 'sukebei' : 'nyaa';
    const GM_STORAGE_PREFIX = `nyaaHighlightBlock:${STORAGE_SCOPE}:`;
    const GM_MISSING_VALUE = '__NYAA_HIGHLIGHT_BLOCK_MISSING_VALUE__';

    // Store settings in Tampermonkey's userscript-scoped storage. Existing
    // localStorage values are migrated on first read and then removed so stale
    // site-visible data cannot reappear later. The local fallback keeps this file
    // usable in development environments without the metadata grants.
    const Storage = {
        hasGMStorage() {
            return typeof GM_getValue === 'function' && typeof GM_setValue === 'function';
        },

        parseLocalValue(rawValue) {
            try {
                return JSON.parse(rawValue);
            } catch {
                return rawValue;
            }
        },

        getLocalValue(key) {
            try {
                const rawValue = localStorage.getItem(key);
                return rawValue === null ? undefined : this.parseLocalValue(rawValue);
            } catch (error) {
                console.warn(`Could not read legacy site setting ${key}:`, error);
                return undefined;
            }
        },

        removeLocalValue(key) {
            try {
                localStorage.removeItem(key);
            } catch (error) {
                console.warn(`Could not remove legacy site setting ${key}:`, error);
            }
        },

        get(key) {
            if (this.hasGMStorage()) {
                const gmKey = `${GM_STORAGE_PREFIX}${key}`;
                try {
                    const storedValue = GM_getValue(gmKey, GM_MISSING_VALUE);
                    if (storedValue !== GM_MISSING_VALUE) {
                        this.removeLocalValue(key);
                        return storedValue;
                    }
                } catch (error) {
                    console.warn(`Could not read userscript setting ${key}:`, error);
                }

                const parsedValue = this.getLocalValue(key);
                if (parsedValue === undefined) return undefined;
                try {
                    GM_setValue(gmKey, parsedValue);
                    this.removeLocalValue(key);
                } catch (error) {
                    console.warn(`Could not migrate userscript setting ${key}:`, error);
                }
                return parsedValue;
            }

            return this.getLocalValue(key);
        },

        set(key, value) {
            if (this.hasGMStorage()) {
                try {
                    GM_setValue(`${GM_STORAGE_PREFIX}${key}`, value);
                    this.removeLocalValue(key);
                    return;
                } catch (error) {
                    console.warn(`Could not save userscript setting ${key}:`, error);
                }
            }

            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch (error) {
                console.error(`Could not save fallback site setting ${key}:`, error);
            }
        }
    };

    const isRule = (rule) => Array.isArray(rule) &&
        rule.length === 2 &&
        rule.every(parts => Array.isArray(parts) && parts.every(value => typeof value === 'string')) &&
        rule[0].some(value => value.trim());

    const isRuleList = (value) => Array.isArray(value) && value.every(isRule);
    const isBoolean = (value) => typeof value === 'boolean';
    const isHexColor = (value) => typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value);
    const isStringArray = (value) => Array.isArray(value) && value.every(item => typeof item === 'string');

    const getRuleKey = (rule) => {
        if (!isRule(rule)) return '';
        const normalize = (parts) => [...new Set(parts
            .map(value => value.trim().toLowerCase()))]
            .sort();
        return JSON.stringify([normalize(rule[0]), normalize(rule[1])]);
    };

    const rulesEqual = (first, second) => getRuleKey(first) !== '' && getRuleKey(first) === getRuleKey(second);

    const hasEquivalentRule = (rules, candidate, ignoredIndex = -1) =>
        rules.some((existingRule, index) => index !== ignoredIndex && rulesEqual(existingRule, candidate));

    const isRuleKey = (value) => {
        if (typeof value !== 'string') return false;
        try {
            const parsed = JSON.parse(value);
            return isRule(parsed) && getRuleKey(parsed) === value;
        } catch {
            return false;
        }
    };
    const isRuleKeyList = (value) => Array.isArray(value) && value.every(isRuleKey);

    // Read and validate a stored setting without preventing startup when a value
    // is corrupt or from an incompatible script version.
    const readStoredValue = (key, fallback, validator) => {
        const value = Storage.get(key);
        if (value === undefined) return cloneValue(fallback);
        if (validator(value)) return cloneValue(value);

        console.warn(`Ignoring incompatible stored value for ${key}.`);
        const fallbackValue = cloneValue(fallback);
        Storage.set(key, fallbackValue);
        return fallbackValue;
    };

    const normalizeCommentThreshold = (value) => {
        const parsed = Number(value);
        return Number.isFinite(parsed)
            ? Math.max(1, Math.floor(parsed))
            : CONFIG.DEFAULTS.COMMENT_RESCUE_THRESHOLD;
    };

    // Auto-import

    const autoImportFansubbers = () => {
        if (!AppState.fansubbersToggle) return;

        let addedCount = 0;
        let adoptedCount = 0;
        PRESETS.FANSUBBERS.forEach(newRule => {
            const isDuplicate = AppState.keywordsHighlight.some(existingRule => rulesEqual(existingRule, newRule));

            const isBlacklisted = AppState.fansubbersBlacklist.some(blacklistedRule => rulesEqual(blacklistedRule, newRule));

            if (isBlacklisted) return;

            const ruleKey = getRuleKey(newRule);
            if (isDuplicate) {
                if (!AppState.autoImportedHighlightRuleKeys.includes(ruleKey)) {
                    AppState.autoImportedHighlightRuleKeys.push(ruleKey);
                    adoptedCount++;
                }
                return;
            }

            if (addedCount === 0 && AppState.editMode.isEditing) {
                exitEditMode();
            }
            AppState.keywordsHighlight.push(cloneValue(newRule));
            AppState.autoImportedHighlightRuleKeys.push(ruleKey);
            addedCount++;
        });

        if (addedCount > 0) {
            sortRules(AppState.keywordsHighlight);
            AppState.saveHighlightKeywords();
        }
        if (addedCount > 0 || adoptedCount > 0) {
            AppState.saveAutoImportedRuleKeys();
        }

        return addedCount + adoptedCount;
    };

    const autoImportMinis = () => {
        if (!AppState.minisToggle) return;

        let addedCount = 0;
        let adoptedCount = 0;
        PRESETS.MINIS.forEach(newRule => {
            const isDuplicate = AppState.keywordsBlock.some(existingRule => rulesEqual(existingRule, newRule));

            const isBlacklisted = AppState.minisBlacklist.some(blacklistedRule => rulesEqual(blacklistedRule, newRule));

            if (isBlacklisted) return;

            const ruleKey = getRuleKey(newRule);
            if (isDuplicate) {
                if (!AppState.autoImportedBlockRuleKeys.includes(ruleKey)) {
                    AppState.autoImportedBlockRuleKeys.push(ruleKey);
                    adoptedCount++;
                }
                return;
            }

            if (addedCount === 0 && AppState.editMode.isEditing) {
                exitEditMode();
            }
            AppState.keywordsBlock.push(cloneValue(newRule));
            AppState.autoImportedBlockRuleKeys.push(ruleKey);
            addedCount++;
        });

        if (addedCount > 0) {
            sortRules(AppState.keywordsBlock);
            AppState.saveBlockKeywords();
        }
        if (addedCount > 0 || adoptedCount > 0) {
            AppState.saveAutoImportedRuleKeys();
        }

        return addedCount + adoptedCount;
    };


    // State

    const AppState = {
        keywordsHighlight: readStoredValue(CONFIG.STORAGE_KEYS.HIGHLIGHT, CONFIG.DEFAULTS.HIGHLIGHT, isRuleList),
        keywordsBlock: readStoredValue(CONFIG.STORAGE_KEYS.BLOCK, CONFIG.DEFAULTS.BLOCK, isRuleList),
        isEnabled: readStoredValue('isEnabled', true, isBoolean),
        fansubbersToggle: readStoredValue(CONFIG.STORAGE_KEYS.FANSUBBERS_TOGGLE, false, isBoolean),
        minisToggle: readStoredValue(CONFIG.STORAGE_KEYS.MINIS_TOGGLE, false, isBoolean),
        fansubbersBlacklist: readStoredValue(CONFIG.STORAGE_KEYS.FANSUBBERS_BLACKLIST, [], isRuleList),
        minisBlacklist: readStoredValue(CONFIG.STORAGE_KEYS.MINIS_BLACKLIST, [], isRuleList),
        blockedCategories: readStoredValue(
            CONFIG.STORAGE_KEYS.BLOCKED_CATEGORIES,
            [],
            value => isStringArray(value) &&
                value.every(category => Object.prototype.hasOwnProperty.call(CATEGORIES, category))
        ),
        commentRescueEnabled: readStoredValue(
            CONFIG.STORAGE_KEYS.COMMENT_RESCUE_ENABLED,
            CONFIG.DEFAULTS.COMMENT_RESCUE_ENABLED,
            isBoolean
        ),
        commentHighlightEnabled: readStoredValue(
            CONFIG.STORAGE_KEYS.COMMENT_HIGHLIGHT_ENABLED,
            readStoredValue(
                CONFIG.STORAGE_KEYS.COMMENT_RESCUE_ENABLED,
                CONFIG.DEFAULTS.COMMENT_HIGHLIGHT_ENABLED,
                isBoolean
            ),
            isBoolean
        ),
        commentRescueThreshold: normalizeCommentThreshold(
            readStoredValue(
                CONFIG.STORAGE_KEYS.COMMENT_RESCUE_THRESHOLD,
                CONFIG.DEFAULTS.COMMENT_RESCUE_THRESHOLD,
                value => Number.isFinite(Number(value)) && Number(value) >= 0
            )
        ),
        showAutoRules: readStoredValue(CONFIG.STORAGE_KEYS.SHOW_AUTO_RULES, true, isBoolean),
        showManualRules: readStoredValue(CONFIG.STORAGE_KEYS.SHOW_MANUAL_RULES, true, isBoolean),
        autoImportedHighlightRuleKeys: readStoredValue(
            CONFIG.STORAGE_KEYS.AUTO_IMPORTED_HIGHLIGHT,
            [],
            isRuleKeyList
        ),
        autoImportedBlockRuleKeys: readStoredValue(
            CONFIG.STORAGE_KEYS.AUTO_IMPORTED_BLOCK,
            [],
            isRuleKeyList
        ),
        editMode: {
            isEditing: false,
            type: null,
            index: null
        },

        saveHighlightKeywords() {
            Storage.set(CONFIG.STORAGE_KEYS.HIGHLIGHT, this.keywordsHighlight);
        },

        saveBlockKeywords() {
            Storage.set(CONFIG.STORAGE_KEYS.BLOCK, this.keywordsBlock);
        },

        saveEnabledState() {
            Storage.set('isEnabled', this.isEnabled);
        },

        saveToggleStates() {
            Storage.set(CONFIG.STORAGE_KEYS.FANSUBBERS_TOGGLE, this.fansubbersToggle);
            Storage.set(CONFIG.STORAGE_KEYS.MINIS_TOGGLE, this.minisToggle);
        },

        saveBlacklists() {
            sortRules(this.fansubbersBlacklist);
            sortRules(this.minisBlacklist);
            Storage.set(CONFIG.STORAGE_KEYS.FANSUBBERS_BLACKLIST, this.fansubbersBlacklist);
            Storage.set(CONFIG.STORAGE_KEYS.MINIS_BLACKLIST, this.minisBlacklist);
        },

        resetEditMode() {
            this.editMode = {
                isEditing: false,
                type: null,
                index: null
            };
        },

        colors: {
            light: readStoredValue('highlightColorLight', '#F0E68C', isHexColor), // khaki
            dark: readStoredValue('highlightColorDark', '#330033', isHexColor) // purple
        },

        saveColors() {
            Storage.set('highlightColorLight', this.colors.light);
            Storage.set('highlightColorDark', this.colors.dark);
        },

        getCurrentHighlightColor() {
            return this.isDarkMode() ? this.colors.dark : this.colors.light;
        },

        isDarkMode() {
            const body = document.body;
            return body.classList.contains('dark');
        },

        saveBlockedCategories() {
            Storage.set(CONFIG.STORAGE_KEYS.BLOCKED_CATEGORIES, this.blockedCategories);
        },

        saveCommentSettings() {
            Storage.set(CONFIG.STORAGE_KEYS.COMMENT_RESCUE_ENABLED, this.commentRescueEnabled);
            Storage.set(CONFIG.STORAGE_KEYS.COMMENT_HIGHLIGHT_ENABLED, this.commentHighlightEnabled);
            Storage.set(CONFIG.STORAGE_KEYS.COMMENT_RESCUE_THRESHOLD, this.commentRescueThreshold);
        },

        isCommentThresholdEnabled() {
            return this.commentRescueEnabled || this.commentHighlightEnabled;
        },

        saveRuleFilters() {
            Storage.set(CONFIG.STORAGE_KEYS.SHOW_AUTO_RULES, this.showAutoRules);
            Storage.set(CONFIG.STORAGE_KEYS.SHOW_MANUAL_RULES, this.showManualRules);
        },

        saveAutoImportedRuleKeys() {
            this.autoImportedHighlightRuleKeys = [...new Set(this.autoImportedHighlightRuleKeys)];
            this.autoImportedBlockRuleKeys = [...new Set(this.autoImportedBlockRuleKeys)];
            Storage.set(
                CONFIG.STORAGE_KEYS.AUTO_IMPORTED_HIGHLIGHT,
                this.autoImportedHighlightRuleKeys
            );
            Storage.set(
                CONFIG.STORAGE_KEYS.AUTO_IMPORTED_BLOCK,
                this.autoImportedBlockRuleKeys
            );
        }
    };

    // Chip input

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

        bindEvents() {
            if (!this.input) return;

            this.input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && this.input.value.trim()) {
                    e.preventDefault();
                    this.addChip(normalizeChipInput(this.input.value));
                    this.input.value = '';
                } else if (e.key === 'Backspace' && !this.input.value && this.chips.length > 0) {
                    this.removeChip(this.chips.length - 1);
                }
            });
        }

        addChip(text) {
            const normalizedText = normalizeChipInput(text);
            const isDuplicate = this.chips.some(chip =>
                chip.toLowerCase() === normalizedText.toLowerCase()
            );
            if (normalizedText && !isDuplicate) {
                this.chips.push(normalizedText);
                this.updateDisplay();
            }
        }

        removeChip(index) {
            if (index >= 0 && index < this.chips.length) {
                this.chips.splice(index, 1);
                this.updateDisplay();
            }
        }

        setChips(chips) {
            this.chips = Array.isArray(chips) ? [...chips] : [];
            this.updateDisplay();
        }

        getChips() {
            return [...this.chips];
        }

        clear() {
            this.chips = [];
            this.updateDisplay();
            if (this.input) {
                this.input.value = '';
            }
        }

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

        updateDisplay() {
            if (!this.display) return;

            this.display.replaceChildren();
            this.chips.forEach((chip, index) => {
                const chipElement = document.createElement('span');
                chipElement.className = 'chip';
                chipElement.dataset.index = String(index);
                chipElement.appendChild(document.createTextNode(`${chip} `));

                const removeElement = document.createElement('span');
                removeElement.className = 'chip-remove';
                removeElement.dataset.index = String(index);
                removeElement.textContent = '×';
                chipElement.appendChild(removeElement);
                this.display.appendChild(chipElement);
            });

            this.bindChipEvents();
            this.updatePlaceholder();
        }

        bindChipEvents() {
            this.display.querySelectorAll('.chip').forEach(chipElement => {
                chipElement.addEventListener('click', (e) => {
                    if (e.target.classList.contains('chip-remove')) return;
                    e.stopPropagation();
                    const index = Number.parseInt(chipElement.dataset.index, 10);
                    this.editChip(index);
                });
            });

            this.display.querySelectorAll('.chip-remove').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    const index = Number.parseInt(e.target.dataset.index, 10);
                    this.removeChip(index);
                });
            });
        }

        updatePlaceholder() {
            if (this.input) {
                this.input.placeholder = this.chips.length === 0
                    ? this.placeholder
                    : 'Add additional word or phrase';
            }
        }
    }

    // Filtering

    const getMatchingRules = (title, rules) => {
        if (!title || typeof title !== 'string' || !Array.isArray(rules)) return [];

        return rules.reduce((matches, [keywordParts, exceptionParts], index) => {
            const keywordPredicates = keywordParts
                .filter(keyword => keyword && keyword.trim())
                .map(keyword => Chips.contains(keyword.trim()));

            const filteredExceptions = Array.isArray(exceptionParts)
                ? exceptionParts.filter(exception => exception && exception.trim())
                : [];

            const exceptionPredicates = filteredExceptions
                .map(exception => Chips.contains(exception.trim()));

            if (keywordPredicates.length === 0) return matches;

            let chain = Chips.from(title).and(Chips.all(keywordPredicates));

            if (exceptionPredicates.length > 0) {
                chain = chain.not(Chips.any(exceptionPredicates));
            }

            if (chain.result()) {
                matches.push({ index, keywordParts, exceptionParts: filteredExceptions });
            }

            return matches;
        }, []);
    };

    const shouldBlockTitle = (title) => {
        return getMatchingRules(title, AppState.keywordsBlock).length > 0;
    };

    // Torrent row UI

    const getTitleFromElement = (titleElement) => {
        const torrentTitleElement = getTorrentTitleElement(titleElement);
        if (!torrentTitleElement) return '';

        return torrentTitleElement.getAttribute('title') ||
            torrentTitleElement.textContent.trim() ||
            '';
    };

    const getTorrentTitleElement = (titleElement) => {
        if (!titleElement) return null;

        if (titleElement.classList.contains('comments')) {
            // The matched-rule indicator is inserted after the comment link, so the
            // torrent title cannot safely be resolved with nextElementSibling.
            const titleCell = titleElement.closest('td');
            return titleCell?.querySelector('a:not(.comments)') || null;
        }

        return titleElement;
    };

    const removeMatchedRuleIndicator = (row) => {
        row.querySelectorAll('.hb-rule-info').forEach(indicator => {
            indicator._hbTooltip?.remove();
            indicator.remove();
        });
    };

    const addMatchedRuleIndicator = (row, titleElement, matchingRules) => {
        if (!matchingRules.length) return;

        const torrentTitleElement = getTorrentTitleElement(titleElement);
        if (!torrentTitleElement) return;

        const titleCell = torrentTitleElement.closest('td');
        if (!titleCell) return;

        const indicator = document.createElement('button');
        indicator.type = 'button';
        indicator.className = 'hb-rule-info';
        indicator.setAttribute('aria-label', `${matchingRules.length} matched highlight ${matchingRules.length === 1 ? 'rule' : 'rules'}`);
        indicator.textContent = '?';

        const tooltip = document.createElement('span');
        tooltip.className = 'hb-rule-tooltip';
        tooltip.setAttribute('role', 'tooltip');

        matchingRules.forEach(({ keywordParts, exceptionParts }) => {
            const rule = document.createElement('span');
            rule.className = 'hb-rule-tooltip-rule';

            keywordParts
                .filter(keyword => keyword && keyword.trim())
                .forEach(keyword => {
                    const chip = document.createElement('span');
                    chip.className = 'colored-chip green-chip';
                    chip.textContent = keyword;
                    rule.appendChild(chip);
                });

            exceptionParts.forEach(exception => {
                const chip = document.createElement('span');
                chip.className = 'colored-chip red-chip';
                chip.textContent = exception;
                rule.appendChild(chip);
            });

            tooltip.appendChild(rule);
        });

        document.body.appendChild(tooltip);
        indicator._hbTooltip = tooltip;

        const positionTooltip = () => {
            const edgeGap = 8;
            const controlGap = 7;
            const indicatorRect = indicator.getBoundingClientRect();
            const tooltipRect = tooltip.getBoundingClientRect();

            let left = indicatorRect.right - tooltipRect.width;
            left = Math.max(edgeGap, Math.min(left, window.innerWidth - tooltipRect.width - edgeGap));

            const fitsBelow = indicatorRect.bottom + controlGap + tooltipRect.height <= window.innerHeight - edgeGap;
            let top = fitsBelow
                ? indicatorRect.bottom + controlGap
                : indicatorRect.top - tooltipRect.height - controlGap;
            top = Math.max(edgeGap, Math.min(top, window.innerHeight - tooltipRect.height - edgeGap));

            tooltip.style.left = `${left}px`;
            tooltip.style.top = `${top}px`;
        };

        let isHovered = false;
        let isFocused = false;
        const showTooltip = () => {
            positionTooltip();
            tooltip.classList.add('hb-rule-tooltip-visible');
        };
        const hideTooltipIfInactive = () => {
            if (!isHovered && !isFocused) {
                tooltip.classList.remove('hb-rule-tooltip-visible');
            }
        };

        indicator.addEventListener('mouseenter', () => {
            isHovered = true;
            showTooltip();
        });
        indicator.addEventListener('mouseleave', () => {
            isHovered = false;
            hideTooltipIfInactive();
        });
        indicator.addEventListener('focus', () => {
            isFocused = true;
            showTooltip();
        });
        indicator.addEventListener('blur', () => {
            isFocused = false;
            hideTooltipIfInactive();
        });
        indicator.addEventListener('click', event => event.preventDefault());

        const commentElement = row.querySelector('a.comments');
        if (commentElement?.closest('td') === titleCell) {
            // Nyaa floats comments right; the following right-floated control sits to its left.
            commentElement.insertAdjacentElement('afterend', indicator);
        } else {
            titleCell.insertBefore(indicator, titleCell.firstChild);
        }
    };

    const getCommentInfoFromRow = (row) => {
        const element = row.querySelector('a.comments');
        if (!element) return { count: 0, element: null };

        const titleMatch = (element.getAttribute('title') || '').match(/([\d,]+)\s+comments?/i);
        const textMatch = element.textContent.match(/[\d,]+/);
        const rawCount = titleMatch?.[1] || textMatch?.[0] || '0';
        const count = Number.parseInt(rawCount.replace(/,/g, ''), 10);

        return { count: Number.isFinite(count) ? count : 0, element };
    };

    const getCategoryFromRow = (row) => {
        const categoryImg = row.querySelector('img[alt]');
        if (!categoryImg) return '';

        const alt = categoryImg.getAttribute('alt') || '';

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

    const getCurrentBrowsingCategory = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const categoryParam = urlParams.get('c');

        if (!categoryParam) return null;

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

    const updateDisplay = debounce(() => {
        const rows = document.querySelectorAll(SELECTORS.TORRENT_ROWS);
        const currentBrowsingCategory = getCurrentBrowsingCategory();

        rows.forEach(row => {
            const titleElement = row.querySelector(SELECTORS.TITLE_ELEMENT);
            const title = getTitleFromElement(titleElement);
            const category = getCategoryFromRow(row);
            const commentInfo = getCommentInfoFromRow(row);

            // Always clear our badge first so changing or disabling the setting is immediate.
            commentInfo.element?.classList.remove('hb-comment-highlight');
            removeMatchedRuleIndicator(row);

            if (!AppState.isEnabled) {
                resetRowAppearance(row);
                return;
            }

            const matchingHighlightRules = getMatchingRules(title, AppState.keywordsHighlight);
            const shouldHighlight = matchingHighlightRules.length > 0;
            const meetsCommentThreshold = commentInfo.count >= AppState.commentRescueThreshold;
            const hasCommentRescue = AppState.commentRescueEnabled &&
                meetsCommentThreshold;

            if (AppState.commentHighlightEnabled && meetsCommentThreshold) {
                commentInfo.element?.classList.add('hb-comment-highlight');
            }

            // Highly discussed torrents stay visible even if a category or title rule blocks them.
            if (hasCommentRescue) {
                row.style.display = '';
                if (shouldHighlight) {
                    applyHighlight(row, titleElement, matchingHighlightRules);
                } else {
                    resetRowAppearance(row);
                }
                return;
            }

            // Check if category is blocked, but skip if it's the current browsing category
            if (category &&
                AppState.blockedCategories.includes(category) &&
                category !== currentBrowsingCategory) {
                row.style.display = 'none';
                return;
            }

            const shouldBlock = shouldBlockTitle(title);

            if (shouldBlock) {
                row.style.display = 'none';
            } else {
                row.style.display = '';

                if (shouldHighlight) {
                    applyHighlight(row, titleElement, matchingHighlightRules);
                } else {
                    resetRowAppearance(row);
                }
            }
        });

        checkIfEverythingBlocked();
    }, CONFIG.DEBOUNCE_DELAY);

    const applyHighlight = (row, titleElement, matchingRules) => {
        // Don't override NyaaBlue's own highlighted rows.
        if (getBestClass(row)) {
            return;
        }

        if (!row.hasAttribute('data-old-class')) {
            row.setAttribute('data-old-class', row.className);
        }
        row.className = "default";

        row.style.backgroundColor = AppState.getCurrentHighlightColor();
        addMatchedRuleIndicator(row, titleElement, matchingRules);
    };

    const getBestClass = (row) => {
        if (row.classList.contains('best-alt')) return 'best-alt';
        if (row.classList.contains('best')) return 'best';
        return null;
    };

    const resetRowStyling = (row, force = false) => {
        removeMatchedRuleIndicator(row);
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
    };

    const resetRowAppearance = (row, force = false) => {
        // Visibility must always be restored, including NyaaBlue best rows.
        row.style.display = '';
        resetRowStyling(row, force);
    };

    const checkIfEverythingBlocked = () => {
        const rows = document.querySelectorAll(SELECTORS.TORRENT_ROWS);
        const visibleRows = Array.from(rows).filter(row => {
            const computedStyle = window.getComputedStyle(row);
            return computedStyle.display !== 'none';
        });

        let messageElement = document.getElementById('everything-blocked-message');

        if (AppState.isEnabled && rows.length > 0 && visibleRows.length === 0) {
            if (!messageElement) {
                messageElement = document.createElement('div');
                messageElement.id = 'everything-blocked-message';
                messageElement.className = 'everything-blocked-message';
                messageElement.appendChild(document.createTextNode(
                    "🚫 Everything's blocked! Maybe your blocking is a little too aggressive..."
                ));

                const subtitle = document.createElement('div');
                subtitle.className = 'subtitle';
                subtitle.appendChild(document.createTextNode(
                    'Try adjusting your block rules or category filters in the '
                ));

                const settingsLink = document.createElement('a');
                settingsLink.href = '#';
                settingsLink.className = 'link-inline';
                settingsLink.textContent = 'settings';
                settingsLink.addEventListener('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    UI.guiContainer.style.display = 'flex';
                    document.getElementById('settings-overlay')?.style.setProperty('display', 'none');
                    document.getElementById('help-popup')?.style.setProperty('display', 'none');
                    UI.updateContainerWidth();
                    UI.syncListHeights();
                });
                subtitle.append(settingsLink, '.');
                messageElement.appendChild(subtitle);

                const torrentTable = document.querySelector('.torrent-list');
                if (torrentTable) {
                    torrentTable.parentNode.insertBefore(messageElement, torrentTable.nextSibling);
                } else {
                    const firstTable = document.querySelector('table');
                    if (firstTable) {
                        firstTable.parentNode.insertBefore(messageElement, firstTable.nextSibling);
                    }
                }
            }

            messageElement.style.display = 'block';
        } else {
            if (messageElement) {
                messageElement.style.display = 'none';
            }
        }
    };

    // Edit mode

    const enterEditMode = (type, index) => {
        const keywords = type === 'highlight' ? AppState.keywordsHighlight : AppState.keywordsBlock;
        if (!Number.isInteger(index) || index < 0 || index >= keywords.length) return;

        if (AppState.editMode.isEditing &&
            (AppState.editMode.type !== type || AppState.editMode.index !== index)) {
            exitEditMode();
        }

        AppState.editMode.isEditing = true;
        AppState.editMode.type = type;
        AppState.editMode.index = index;

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

    const exitEditMode = () => {
        AppState.resetEditMode();

        updateEditButton('add-keyword-highlight-btn', 'Add Highlight Rule', '#555');
        updateEditButton('add-keyword-block-btn', 'Add Block Rule', '#555');

        removeCancelButtons();

        hideValidationError('highlight');
        hideValidationError('block');

        if (UI.chipInputs) {
            Object.values(UI.chipInputs).forEach(input => input.clear());
        }

        updateRuleLists();
    };

    const updateEditButton = (buttonId, text, color = '#28a745') => {
        const button = document.getElementById(buttonId);
        if (button) {
            button.textContent = text;
            button.style.backgroundColor = color;
        }
    };

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

    const removeCancelButtons = () => {
        ['highlight-cancel-container', 'block-cancel-container'].forEach(id => {
            const button = document.getElementById(id);
            if (button) button.remove();
        });
    };

    // Rule management

    const addKeywordToHighlight = () => {
        if (!UI.chipInputs) return;

        hideValidationError('highlight');

        let keywordParts = UI.chipInputs.highlightKeyword.getChips();
        let exceptionParts = UI.chipInputs.highlightException.getChips();

        const keywordInputText = UI.chipInputs.highlightKeyword.input.value.trim();
        const exceptionInputText = UI.chipInputs.highlightException.input.value.trim();

        if (keywordInputText || exceptionInputText) {
            let warningMessage = 'Warning: You have text that hasn\'t been converted to chips.\nPress "Enter" in each field to convert text to chips, then try again.';
            showValidationError('highlight', warningMessage);
            return;
        }

        if (keywordParts.length === 0) {
            showValidationError('highlight', 'Error: Please add at least one keyword.');
            return;
        }

        if (keywordParts.length === 0 && exceptionParts.length > 0) {
            showValidationError('highlight', 'Error: Cannot create a rule with only exceptions. Please add at least one keyword.');
            return;
        }

        if (AppState.editMode.isEditing && AppState.editMode.type === 'highlight') {
            const updatedRule = [keywordParts, exceptionParts];
            if (hasEquivalentRule(AppState.keywordsHighlight, updatedRule, AppState.editMode.index)) {
                showValidationError('highlight', 'Error: An equivalent highlight rule already exists.');
                return;
            }

            const originalRule = AppState.keywordsHighlight[AppState.editMode.index];
            const originalKey = getRuleKey(originalRule);
            const wasAutoImported = AppState.autoImportedHighlightRuleKeys.includes(originalKey);
            AppState.keywordsHighlight[AppState.editMode.index] = updatedRule;
            AppState.autoImportedHighlightRuleKeys = AppState.autoImportedHighlightRuleKeys
                .filter(key => key !== originalKey);
            if (wasAutoImported && !AppState.fansubbersBlacklist.some(rule => rulesEqual(rule, originalRule))) {
                AppState.fansubbersBlacklist.push(cloneValue(originalRule));
                AppState.saveBlacklists();
            }
            AppState.saveAutoImportedRuleKeys();
            sortRules(AppState.keywordsHighlight);
            exitEditMode();
        } else {
            const newRule = [keywordParts, exceptionParts];
            const isDuplicate = hasEquivalentRule(AppState.keywordsHighlight, newRule);

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

    const addKeywordToBlock = () => {
        if (!UI.chipInputs) return;

        hideValidationError('block');

        let keywordParts = UI.chipInputs.blockKeyword.getChips();
        let exceptionParts = UI.chipInputs.blockException.getChips();

        const keywordInputText = UI.chipInputs.blockKeyword.input.value.trim();
        const exceptionInputText = UI.chipInputs.blockException.input.value.trim();

        if (keywordInputText || exceptionInputText) {
            let warningMessage = 'Warning: You have text that hasn\'t been converted to chips.\nPress "Enter" in each field to convert text to chips, then try again.';
            showValidationError('block', warningMessage);
            return;
        }

        if (keywordParts.length === 0) {
            showValidationError('block', 'Error: Please add at least one keyword.');
            return;
        }

        if (keywordParts.length === 0 && exceptionParts.length > 0) {
            showValidationError('block', 'Error: Cannot create a rule with only exceptions. Please add at least one keyword.');
            return;
        }

        if (AppState.editMode.isEditing && AppState.editMode.type === 'block') {
            const updatedRule = [keywordParts, exceptionParts];
            if (hasEquivalentRule(AppState.keywordsBlock, updatedRule, AppState.editMode.index)) {
                showValidationError('block', 'Error: An equivalent block rule already exists.');
                return;
            }

            const originalRule = AppState.keywordsBlock[AppState.editMode.index];
            const originalKey = getRuleKey(originalRule);
            const wasAutoImported = AppState.autoImportedBlockRuleKeys.includes(originalKey);
            AppState.keywordsBlock[AppState.editMode.index] = updatedRule;
            AppState.autoImportedBlockRuleKeys = AppState.autoImportedBlockRuleKeys
                .filter(key => key !== originalKey);
            if (wasAutoImported && !AppState.minisBlacklist.some(rule => rulesEqual(rule, originalRule))) {
                AppState.minisBlacklist.push(cloneValue(originalRule));
                AppState.saveBlacklists();
            }
            AppState.saveAutoImportedRuleKeys();
            sortRules(AppState.keywordsBlock);
            exitEditMode();
        } else {
            const newRule = [keywordParts, exceptionParts];
            const isDuplicate = hasEquivalentRule(AppState.keywordsBlock, newRule);

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

    const removeBlacklistRule = (type, index) => {
        const list = type === 'fansubbers' ? AppState.fansubbersBlacklist : AppState.minisBlacklist;
        if (!list || index < 0 || index >= list.length) return;
        if (AppState.editMode.isEditing) exitEditMode();
        const removedRule = list[index];
        list.splice(index, 1);
        AppState.saveBlacklists();

        if (type === 'fansubbers') {
            const isDuplicate = AppState.keywordsHighlight.some(existingRule => rulesEqual(existingRule, removedRule));
            if (!isDuplicate) {
                AppState.keywordsHighlight.push(cloneValue(removedRule));
                if (AppState.fansubbersToggle) {
                    AppState.autoImportedHighlightRuleKeys.push(getRuleKey(removedRule));
                    AppState.saveAutoImportedRuleKeys();
                }
                sortRules(AppState.keywordsHighlight);
                AppState.saveHighlightKeywords();
            }
        } else {
            const isDuplicate = AppState.keywordsBlock.some(existingRule => rulesEqual(existingRule, removedRule));
            if (!isDuplicate) {
                AppState.keywordsBlock.push(cloneValue(removedRule));
                if (AppState.minisToggle) {
                    AppState.autoImportedBlockRuleKeys.push(getRuleKey(removedRule));
                    AppState.saveAutoImportedRuleKeys();
                }
                sortRules(AppState.keywordsBlock);
                AppState.saveBlockKeywords();
            }
        }

        updateBlacklistLists();
        updateRuleLists();
        updateDisplay();
    };

    const sortRules = (rules) => {
        rules.sort((a, b) => {
            const keywordA = a[0].join(' ').toLowerCase().replace(/^[\[\(]/, '');
            const keywordB = b[0].join(' ').toLowerCase().replace(/^[\[\(]/, '');
            return keywordA.localeCompare(keywordB);
        });
    };

    const isAutoImportedRule = (type, keywordParts, exceptionParts) => {
        const trackedKeys = type === 'highlight'
            ? AppState.autoImportedHighlightRuleKeys
            : AppState.autoImportedBlockRuleKeys;
        return trackedKeys.includes(getRuleKey([keywordParts, exceptionParts]));
    };

    const isPresetRuleForType = (type, rule) => {
        const presets = type === 'highlight' ? PRESETS.FANSUBBERS : PRESETS.MINIS;
        return presets.some(presetRule => rulesEqual(presetRule, rule));
    };

    const isDefaultRuleForType = (type, rule) => {
        const defaults = type === 'highlight' ? CONFIG.DEFAULTS.HIGHLIGHT : CONFIG.DEFAULTS.BLOCK;
        return defaults.some(defaultRule => rulesEqual(defaultRule, rule));
    };

    // Remove the single rule represented by each tracked auto-import key. This is
    // deliberately occurrence-based so legacy duplicate rules cannot cause one
    // tracked entry to remove every equivalent manual entry.
    const removeTrackedRuleOccurrences = (rules, trackedKeys) => {
        const pendingKeys = new Set(trackedKeys);
        return rules.filter((rule) => {
            const key = getRuleKey(rule);
            if (!pendingKeys.has(key)) return true;
            pendingKeys.delete(key);
            return false;
        });
    };

    // Remove tracked auto-imported rules, then optionally clean up matching rules
    // left by versions that predate provenance tracking.
    const removeAutoImportedRules = async (type) => {
        const isHighlight = type === 'highlight';
        const rulesProperty = isHighlight ? 'keywordsHighlight' : 'keywordsBlock';
        const trackedProperty = isHighlight
            ? 'autoImportedHighlightRuleKeys'
            : 'autoImportedBlockRuleKeys';

        if (AppState.editMode.isEditing) exitEditMode();

        AppState[rulesProperty] = removeTrackedRuleOccurrences(
            AppState[rulesProperty],
            AppState[trackedProperty]
        );
        AppState[trackedProperty] = [];
        AppState.saveAutoImportedRuleKeys();
        if (isHighlight) AppState.saveHighlightKeywords();
        else AppState.saveBlockKeywords();
        updateRuleLists();
        updateDisplay();

        const legacyCandidates = AppState[rulesProperty].filter(rule =>
            isPresetRuleForType(type, rule) && !isDefaultRuleForType(type, rule)
        );
        if (legacyCandidates.length === 0) return;

        const removeLegacy = await openNoticeModal({
            title: 'Legacy Preset Rules Found',
            message:
                `Found ${legacyCandidates.length} preset-matching rule${legacyCandidates.length === 1 ? '' : 's'} ` +
                'without auto-import tracking. These may have been added automatically by an older version, ' +
                'or added manually.\n\nRemove them too?',
            showCancel: true,
            okText: 'Remove Them',
            cancelText: 'Keep Them'
        });
        if (!removeLegacy) return;

        const legacyKeys = new Set(legacyCandidates.map(getRuleKey));
        AppState[rulesProperty] = AppState[rulesProperty]
            .filter(rule => !legacyKeys.has(getRuleKey(rule)));
        if (isHighlight) AppState.saveHighlightKeywords();
        else AppState.saveBlockKeywords();
        updateRuleLists();
        updateDisplay();
    };

    const showValidationError = (type, message) => {
        const errorElement = document.getElementById(`${type}-validation-error`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');

            setTimeout(() => {
                hideValidationError(type);
            }, 10000);
        }
    };

    const hideValidationError = (type) => {
        const errorElement = document.getElementById(`${type}-validation-error`);
        if (errorElement) {
            errorElement.classList.remove('show');
            errorElement.textContent = '';
        }
    };

    const removeRule = (type, index) => {
        const rules = type === 'highlight' ? AppState.keywordsHighlight : AppState.keywordsBlock;
        if (!Number.isInteger(index) || index < 0 || index >= rules.length) return;
        if (AppState.editMode.isEditing) exitEditMode();

        if (type === 'highlight') {
            const removedRule = AppState.keywordsHighlight[index];

            const isFromFansubbers = PRESETS.FANSUBBERS.some(presetRule =>
                rulesEqual(presetRule, removedRule)
            );

            if (isFromFansubbers && !hasEquivalentRule(AppState.fansubbersBlacklist, removedRule)) {
                AppState.fansubbersBlacklist.push(cloneValue(removedRule));
                AppState.saveBlacklists();
            }

            AppState.keywordsHighlight.splice(index, 1);
            AppState.autoImportedHighlightRuleKeys = AppState.autoImportedHighlightRuleKeys
                .filter(key => key !== getRuleKey(removedRule));
            AppState.saveAutoImportedRuleKeys();
            AppState.saveHighlightKeywords();
        } else {
            const removedRule = AppState.keywordsBlock[index];

            const isFromMinis = PRESETS.MINIS.some(presetRule =>
                rulesEqual(presetRule, removedRule)
            );

            if (isFromMinis && !hasEquivalentRule(AppState.minisBlacklist, removedRule)) {
                AppState.minisBlacklist.push(cloneValue(removedRule));
                AppState.saveBlacklists();
            }

            AppState.keywordsBlock.splice(index, 1);
            AppState.autoImportedBlockRuleKeys = AppState.autoImportedBlockRuleKeys
                .filter(key => key !== getRuleKey(removedRule));
            AppState.saveAutoImportedRuleKeys();
            AppState.saveBlockKeywords();
        }

        updateRuleLists();
        updateDisplay();
    };


    const mergeRules = (targetRules, incomingRules) => {
        let added = 0;
        (incomingRules || []).forEach((newRule) => {
            const isDuplicate = targetRules.some(existingRule => rulesEqual(existingRule, newRule));
            if (!isDuplicate) {
                targetRules.push(cloneValue(newRule));
                added++;
            }
        });

        if (added > 0) {
            sortRules(targetRules);
        }

        return added;
    };

    const validateImportedConfiguration = (config) => {
        if (!config || typeof config !== 'object' || Array.isArray(config)) {
            throw new Error('The top-level value must be an object.');
        }
        if (!isRuleList(config.keywordsHighlight) || !isRuleList(config.keywordsBlock)) {
            throw new Error('Highlight and block rules must use the expected rule format.');
        }

        const optionalBooleanFields = [
            'isEnabled',
            'fansubbersToggle',
            'minisToggle',
            'commentRescueEnabled',
            'commentHighlightEnabled',
            'showAutoRules',
            'showManualRules'
        ];
        optionalBooleanFields.forEach(field => {
            if (config[field] !== undefined && !isBoolean(config[field])) {
                throw new Error(`${field} must be true or false.`);
            }
        });

        ['fansubbersBlacklist', 'minisBlacklist'].forEach(field => {
            if (config[field] !== undefined && !isRuleList(config[field])) {
                throw new Error(`${field} must use the expected rule format.`);
            }
        });

        if (config.blockedCategories !== undefined &&
            (!isStringArray(config.blockedCategories) ||
                !config.blockedCategories.every(category => Object.prototype.hasOwnProperty.call(CATEGORIES, category)))) {
            throw new Error('blockedCategories contains an unsupported category.');
        }

        if (config.commentRescueThreshold !== undefined &&
            (!Number.isFinite(Number(config.commentRescueThreshold)) || Number(config.commentRescueThreshold) < 1)) {
            throw new Error('commentRescueThreshold must be a positive number.');
        }

        if (config.colors !== undefined &&
            (!config.colors || typeof config.colors !== 'object' ||
                !isHexColor(config.colors.light) || !isHexColor(config.colors.dark))) {
            throw new Error('Highlight colors must be six-digit hexadecimal colors.');
        }

        ['autoImportedHighlightRuleKeys', 'autoImportedBlockRuleKeys'].forEach(field => {
            if (config[field] !== undefined && !isRuleKeyList(config[field])) {
                throw new Error(`${field} must be a list of rule identifiers.`);
            }
        });

        return cloneValue(config);
    };

    const syncSettingsControls = () => {
        const setChecked = (id, checked) => {
            const element = document.getElementById(id);
            if (element) element.checked = checked;
        };

        setChecked('toggle-highlight-block-switch', AppState.isEnabled);
        setChecked('fansubbers-toggle', AppState.fansubbersToggle);
        setChecked('minis-toggle', AppState.minisToggle);
        setChecked('comment-rescue-toggle', AppState.commentRescueEnabled);
        setChecked('comment-highlight-toggle', AppState.commentHighlightEnabled);
        setChecked('show-auto-rules', AppState.showAutoRules);
        setChecked('show-manual-rules', AppState.showManualRules);

        const commentThreshold = document.getElementById('comment-rescue-threshold');
        if (commentThreshold) {
            commentThreshold.value = AppState.commentRescueThreshold;
            commentThreshold.disabled = !AppState.isCommentThresholdEnabled();
        }

        const lightPicker = document.getElementById('light-color-picker');
        const darkPicker = document.getElementById('dark-color-picker');
        if (lightPicker) lightPicker.value = AppState.colors.light;
        if (darkPicker) darkPicker.value = AppState.colors.dark;

        document.querySelectorAll('.category-checkbox').forEach(checkbox => {
            checkbox.checked = AppState.blockedCategories.includes(checkbox.dataset.category);
        });
    };

    const exportConfiguration = () => {
        const config = {
            version: "1.1",
            timestamp: new Date().toISOString(),
            keywordsHighlight: AppState.keywordsHighlight,
            keywordsBlock: AppState.keywordsBlock,
            isEnabled: AppState.isEnabled,
            colors: AppState.colors,
            fansubbersToggle: AppState.fansubbersToggle,
            minisToggle: AppState.minisToggle,
            fansubbersBlacklist: AppState.fansubbersBlacklist,
            minisBlacklist: AppState.minisBlacklist,
            blockedCategories: AppState.blockedCategories,
            commentRescueEnabled: AppState.commentRescueEnabled,
            commentHighlightEnabled: AppState.commentHighlightEnabled,
            commentRescueThreshold: AppState.commentRescueThreshold,
            showAutoRules: AppState.showAutoRules,
            showManualRules: AppState.showManualRules,
            autoImportedHighlightRuleKeys: AppState.autoImportedHighlightRuleKeys,
            autoImportedBlockRuleKeys: AppState.autoImportedBlockRuleKeys
        };


        const dataStr = JSON.stringify(config, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `nyaa-highlight-block-config-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(link.href), 0);
    };

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

    const openNoticeModal = ({
        title,
        message,
        showCancel = false,
        okText = 'OK',
        cancelText = 'Cancel',
        sourceLabel = ''
    }) => {
        return new Promise((resolve) => {
            const overlay = document.getElementById('notice-modal');
            const sourceEl = document.getElementById('notice-source');
            const titleEl = document.getElementById('notice-title');
            const messageEl = document.getElementById('notice-message');
            const okBtn = document.getElementById('notice-ok');
            const cancelBtn = document.getElementById('notice-cancel');
            const closeBtn = document.getElementById('notice-close');

            if (!overlay || !sourceEl || !titleEl || !messageEl || !okBtn || !cancelBtn || !closeBtn) {
                resolve(false);
                return;
            }

            sourceEl.textContent = sourceLabel;
            sourceEl.classList.toggle('hb-hidden', !sourceLabel);
            overlay.classList.toggle('hb-update-announcement', Boolean(sourceLabel));
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

    const openSettingsSection = (targetId) => {
        const target = document.getElementById(targetId);
        const settingsOverlay = document.getElementById('settings-overlay');
        if (!target || !settingsOverlay || !UI.guiContainer) return;

        UI.guiContainer.style.display = 'flex';
        UI.updateContainerWidth();
        document.getElementById('help-popup')?.style.setProperty('display', 'none');
        settingsOverlay.style.display = 'block';

        requestAnimationFrame(() => {
            // The normal navbar opener performs this after making the GUI visible.
            // Direct announcement links need the same layout pass.
            UI.syncListHeights();

            // Scroll only the settings panel; scrollIntoView can also move the
            // underlying GUI and leave it looking compressed until a reload.
            const targetTop = target.offsetTop - 20;
            settingsOverlay.scrollTo({
                top: Math.max(0, targetTop),
                behavior: 'smooth'
            });
            target.classList.add('hb-settings-target');
            setTimeout(() => target.classList.remove('hb-settings-target'), 2200);
        });
    };

    const showLatestUpdateAnnouncement = () => {
        const latest = LATEST_UPDATE_ANNOUNCEMENT;
        if (!latest ||
            !Number.isSafeInteger(latest.id) ||
            latest.id < 1 ||
            typeof latest.title !== 'string' ||
            typeof latest.message !== 'string') {
            return;
        }

        const storedId = Number(Storage.get(CONFIG.STORAGE_KEYS.LAST_SEEN_ANNOUNCEMENT));
        const lastSeenId = Number.isSafeInteger(storedId) && storedId >= 0 ? storedId : 0;
        if (lastSeenId >= latest.id) return;

        const noticeModal = document.getElementById('notice-modal');
        if (!noticeModal) return;

        const settingsTarget = typeof latest.settingsTargetId === 'string'
            ? document.getElementById(latest.settingsTargetId)
            : null;
        const hasSettingsLink = Boolean(settingsTarget);

        // Record before opening so refreshes or closed tabs cannot display it twice.
        Storage.set(CONFIG.STORAGE_KEYS.LAST_SEEN_ANNOUNCEMENT, latest.id);
        void openNoticeModal({
            title: latest.title,
            message: latest.message,
            sourceLabel: 'NYAA HIGHLIGHT & BLOCK USERSCRIPT UPDATE',
            showCancel: hasSettingsLink,
            okText: hasSettingsLink && typeof latest.settingsLinkText === 'string'
                ? latest.settingsLinkText
                : 'Got it',
            cancelText: 'Got it'
        }).then(openSettings => {
            if (openSettings && hasSettingsLink) {
                // Wait until the modal click has finished bubbling so the Settings
                // outside-click handler cannot immediately close the target panel.
                requestAnimationFrame(() => openSettingsSection(latest.settingsTargetId));
            }
        });
    };

    const importConfiguration = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        const handleFile = (mode, file) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const config = validateImportedConfiguration(JSON.parse(e.target.result));

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
                        exitEditMode();
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

                    exitEditMode();
                    // Override is a complete replacement. Fields absent from older
                    // export versions use the current defaults.
                    AppState.keywordsHighlight = cloneValue(config.keywordsHighlight);
                    AppState.keywordsBlock = cloneValue(config.keywordsBlock);
                    sortRules(AppState.keywordsHighlight);
                    sortRules(AppState.keywordsBlock);
                    AppState.isEnabled = config.isEnabled ?? true;
                    AppState.fansubbersToggle = config.fansubbersToggle ?? false;
                    AppState.minisToggle = config.minisToggle ?? false;
                    AppState.fansubbersBlacklist = cloneValue(config.fansubbersBlacklist ?? []);
                    AppState.minisBlacklist = cloneValue(config.minisBlacklist ?? []);
                    AppState.blockedCategories = cloneValue(config.blockedCategories ?? []);
                    AppState.commentRescueEnabled = config.commentRescueEnabled
                        ?? CONFIG.DEFAULTS.COMMENT_RESCUE_ENABLED;
                    AppState.commentHighlightEnabled = config.commentHighlightEnabled
                        ?? config.commentRescueEnabled
                        ?? CONFIG.DEFAULTS.COMMENT_HIGHLIGHT_ENABLED;
                    AppState.commentRescueThreshold = normalizeCommentThreshold(
                        config.commentRescueThreshold ?? CONFIG.DEFAULTS.COMMENT_RESCUE_THRESHOLD
                    );
                    AppState.showAutoRules = config.showAutoRules ?? true;
                    AppState.showManualRules = config.showManualRules ?? true;
                    const importedHighlightKeys = new Set(AppState.keywordsHighlight.map(getRuleKey));
                    const importedBlockKeys = new Set(AppState.keywordsBlock.map(getRuleKey));
                    AppState.autoImportedHighlightRuleKeys = cloneValue(
                        config.autoImportedHighlightRuleKeys ?? []
                    ).filter(key => importedHighlightKeys.has(key));
                    AppState.autoImportedBlockRuleKeys = cloneValue(
                        config.autoImportedBlockRuleKeys ?? []
                    ).filter(key => importedBlockKeys.has(key));
                    AppState.colors = config.colors
                        ? cloneValue(config.colors)
                        : { light: '#F0E68C', dark: '#330033' };

                    AppState.saveHighlightKeywords();
                    AppState.saveBlockKeywords();
                    AppState.saveEnabledState();
                    AppState.saveToggleStates();
                    AppState.saveBlacklists();
                    AppState.saveBlockedCategories();
                    AppState.saveCommentSettings();
                    AppState.saveColors();
                    AppState.saveRuleFilters();
                    AppState.saveAutoImportedRuleKeys();

                    updateRuleLists();
                    updateDisplay();
                    syncSettingsControls();

                    await openNoticeModal({
                        title: 'Import Complete',
                        message: 'Configuration imported successfully!'
                    });
                } catch (error) {
                    await openNoticeModal({
                        title: 'Import Error',
                        message: `Could not import configuration: ${error.message}`
                    });
                    console.error('Import error:', error);
                }
            };
            reader.readAsText(file);
        };

        input.onchange = async (event) => {
            const file = event.target.files[0];
            if (!file) return;
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
                '- Enable comment visibility and highlighting with a threshold of 5\n' +
                '- Show both auto and manual rules\n' +
                '- Enable the script if it was disabled\n\n' +
                'This action cannot be undone. Do you want to continue?',
            showCancel: true
        });

        if (confirmed) {
            exitEditMode();
            AppState.keywordsHighlight = cloneValue(CONFIG.DEFAULTS.HIGHLIGHT);
            AppState.keywordsBlock = cloneValue(CONFIG.DEFAULTS.BLOCK);
            AppState.isEnabled = true;
            AppState.fansubbersToggle = false;
            AppState.minisToggle = false;
            AppState.fansubbersBlacklist = [];
            AppState.minisBlacklist = [];
            AppState.blockedCategories = [];
            AppState.commentRescueEnabled = CONFIG.DEFAULTS.COMMENT_RESCUE_ENABLED;
            AppState.commentHighlightEnabled = CONFIG.DEFAULTS.COMMENT_HIGHLIGHT_ENABLED;
            AppState.commentRescueThreshold = CONFIG.DEFAULTS.COMMENT_RESCUE_THRESHOLD;
            AppState.showAutoRules = true;
            AppState.showManualRules = true;
            AppState.autoImportedHighlightRuleKeys = [];
            AppState.autoImportedBlockRuleKeys = [];
            AppState.colors = {
                light: '#F0E68C', // khaki
                dark: '#330033' // purple
            };

            AppState.saveHighlightKeywords();
            AppState.saveBlockKeywords();
            AppState.saveEnabledState();
            AppState.saveToggleStates();
            AppState.saveBlacklists();
            AppState.saveBlockedCategories();
            AppState.saveCommentSettings();
            AppState.saveColors();
            AppState.saveRuleFilters();
            AppState.saveAutoImportedRuleKeys();

            updateRuleLists();
            updateDisplay();

            syncSettingsControls();
        }
    };

    // Color pickers

    const handleLightColorChange = (event) => {
        AppState.colors.light = event.target.value;
        AppState.saveColors();
        updateDisplay();
    };

    const handleDarkColorChange = (event) => {
        AppState.colors.dark = event.target.value;
        AppState.saveColors();
        updateDisplay();
    };

    const resetLightColor = () => {
        AppState.colors.light = '#F0E68C'; // khaki
        AppState.saveColors();
        const lightPicker = document.getElementById('light-color-picker');
        if (lightPicker) {
            lightPicker.value = AppState.colors.light;
        }
        updateDisplay();
    };

    const resetDarkColor = () => {
        AppState.colors.dark = '#330033'; // purple
        AppState.saveColors();
        const darkPicker = document.getElementById('dark-color-picker');
        if (darkPicker) {
            darkPicker.value = AppState.colors.dark;
        }
        updateDisplay();
    };

    // Theme and NyaaBlue monitoring

    const initThemeAndNyaaBlueMonitoring = () => {
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type !== 'attributes' || mutation.attributeName !== 'class') {
                    continue;
                }

                const target = mutation.target;

                if (target === document.body) {
                    updateDisplay();
                    continue;
                }

                if (target.matches?.('tr') && getBestClass(target)) {
                    // Keep the current visibility until filters are re-evaluated.
                    resetRowStyling(target, true);
                    updateDisplay();
                }
            }
        });

        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['class']
        });

        document.querySelectorAll(SELECTORS.TORRENT_ROWS).forEach(row => {
            observer.observe(row, {
                attributes: true,
                attributeFilter: ['class']
            });
        });
    };


    // UI

    const UI = {
        guiContainer: null,
        openButton: null,
        chipInputs: null,

        init() {
            this.createStyles();
            this.createGUIContainer();
            this.createOpenButton();
            this.bindEvents();
            this.initializeChipInputs();
            updateRuleLists();
        },

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

                .help-popup ul {
                    margin: 0;
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

                .toggle-container,
                .settings-control-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .toggle-label {
                    font-size: 12px;
                    color: #ccc;
                    white-space: nowrap;
                    font-weight: normal;
                }

                .settings-control-stack {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .settings-input-row {
                    flex-wrap: nowrap;
                }

                .settings-input-row > label.toggle-label {
                    flex: 0 1 auto;
                    min-width: 0;
                    margin: 0;
                    line-height: 1.2;
                    white-space: normal;
                }

                .settings-input-row .settings-number-input {
                    box-sizing: border-box;
                    flex: 0 0 56px;
                    width: 56px;
                }

                .settings-number-input {
                    width: 72px;
                    padding: 5px 7px;
                    border: 1px solid #666;
                    border-radius: 4px;
                    background-color: #222;
                    color: white;
                }

                .settings-number-input:disabled {
                    opacity: 0.55;
                    cursor: not-allowed;
                }

                .settings-description {
                    margin: 0;
                    color: #ccc;
                    font-size: 12px;
                    line-height: 1.4;
                }

                a.comments.hb-comment-highlight {
                    background-color: #edffff !important;
                    border-color: #126f82 !important;
                    color: #126f82 !important;
                    font-weight: 700;
                    text-decoration: none !important;
                }

                body.dark a.comments.hb-comment-highlight {
                    background-color: #1d4652 !important;
                    border-color: #a9e3f1 !important;
                    color: #a9e3f1 !important;
                }

                .hb-rule-info {
                    appearance: none;
                    position: relative;
                    float: right;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 16px;
                    height: 16px;
                    margin: 2px 5px 0 5px;
                    padding: 0;
                    border: 1px solid rgba(0, 0, 0, 0.58);
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.72);
                    color: #222;
                    font: 700 11px/1 sans-serif;
                    cursor: help;
                    opacity: 0.72;
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.18);
                    transition: opacity 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease;
                    z-index: 5;
                }

                tr:hover .hb-rule-info,
                .hb-rule-info:hover,
                .hb-rule-info:focus-visible {
                    opacity: 1;
                    background-color: #fff;
                    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.38);
                    outline: none;
                }

                .hb-rule-tooltip {
                    position: fixed;
                    display: block;
                    width: max-content;
                    max-width: min(380px, calc(100vw - 24px));
                    padding: 8px 10px;
                    border: 1px solid rgba(255, 255, 255, 0.22);
                    border-radius: 5px;
                    background: rgba(24, 24, 24, 0.97);
                    color: #f4f4f4;
                    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.35);
                    font: 12px/1.4 sans-serif;
                    text-align: left;
                    white-space: normal;
                    transform: translateY(-2px);
                    visibility: hidden;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.12s ease, transform 0.12s ease, visibility 0.12s;
                    z-index: 2147483647;
                }

                .hb-rule-tooltip-rule {
                    display: block;
                }

                .hb-rule-tooltip-rule {
                    white-space: normal;
                }

                .hb-rule-tooltip-rule + .hb-rule-tooltip-rule {
                    margin-top: 5px;
                    padding-top: 5px;
                    border-top: 1px solid rgba(255, 255, 255, 0.14);
                }

                .hb-rule-tooltip-visible {
                    visibility: visible;
                    opacity: 1;
                    transform: translateY(0);
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

                .settings-header,
                .hb-modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .settings-header {
                    margin-bottom: 20px;
                    border-bottom: 1px solid #555;
                    padding-bottom: 10px;
                }

                .settings-header h3,
                .hb-modal-header h4 {
                    margin: 0;
                }

                .hb-announcement-source {
                    margin-bottom: 4px;
                    color: #5bc0de;
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
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
                    transition: border-color 0.25s ease, box-shadow 0.25s ease;
                }

                .settings-section.hb-settings-target {
                    border-color: #5bc0de;
                    box-shadow: 0 0 0 2px rgba(91, 192, 222, 0.3), 0 0 18px rgba(91, 192, 222, 0.24);
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

                .blacklist-section {
                    display: flex;
                    gap: 20px;
                    flex-wrap: wrap;
                    margin-top: 8px;
                }

                .blacklist-group {
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .blacklist-label {
                    font-size: 13px;
                    font-weight: 400;
                    letter-spacing: 0.02em;
                    text-transform: uppercase;
                    color: #f0f0f0;
                    padding-bottom: 4px;
                    border-bottom: 1px solid #555;
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

                .hb-update-announcement .hb-modal {
                    border-color: #5bc0de;
                    box-shadow: 0 6px 28px rgba(0, 0, 0, 0.68), 0 0 20px rgba(91, 192, 222, 0.22);
                }

                .hb-modal-header {
                    margin-bottom: 12px;
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

            // Keep startup announcements visible without opening the main H&B GUI.
            const noticeModal = this.guiContainer.querySelector('#notice-modal');
            if (noticeModal) {
                document.body.appendChild(noticeModal);
            }

            this.updateContainerWidth();
        },

        updateContainerWidth() {
            if (!this.guiContainer) return;
            const screenWidth = window.innerWidth;

            if (screenWidth < 1200) {
                this.guiContainer.style.width = '80vw';
            } else {
                this.guiContainer.style.width = '50vw';
            }
        },

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
                            <p>Must contain:</p>
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
                        <div class="settings-section" id="highlight-colors-settings">
                            <h4>Highlight Colors</h4>
                            <div class="settings-control-stack">
                                <div class="settings-control-row">
                                    <label class="toggle-label">Light mode color:</label>
                                    <input type="color" id="light-color-picker" value="${AppState.colors.light}" class="color-picker">
                                    <button id="reset-light-color" class="reset-color-btn" title="Reset to default">↺</button>
                                </div>
                                <div class="settings-control-row">
                                    <label class="toggle-label">Dark mode color:</label>
                                    <input type="color" id="dark-color-picker" value="${AppState.colors.dark}" class="color-picker">
                                    <button id="reset-dark-color" class="reset-color-btn" title="Reset to default">↺</button>
                                </div>
                            </div>
                        </div>

                        ${!isSukebei ? `
                        <div class="settings-section" id="auto-import-settings">
                            <h4>Auto-Import Rules</h4>
                            <div class="settings-control-stack">
                                <div class="settings-control-row">
                                    <span class="toggle-label">Auto-highlight fansubbers:</span>
                                    <label class="switch">
                                        <input type="checkbox" id="fansubbers-toggle" ${AppState.fansubbersToggle ? 'checked' : ''}>
                                        <span class="slider"></span>
                                    </label>
                                </div>
                                <div class="settings-control-row">
                                    <span class="toggle-label">Auto-block minis:</span>
                                    <label class="switch">
                                        <input type="checkbox" id="minis-toggle" ${AppState.minisToggle ? 'checked' : ''}>
                                        <span class="slider"></span>
                                    </label>
                                </div>
                                <p class="settings-description">
                                    If you remove rules from the auto-highlight list or the auto-block list,
                                    the below blacklists will populate so the rules are not re-added in the future.
                                    If you change your mind, removing a rule from the blacklist will add it back to your highlight/block rules.
                                </p>
                                <div class="settings-buttons">
                                    <button id="toggle-blacklists-btn" class="action-button">Show Blacklists</button>
                                </div>
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

                        <div class="settings-section" id="block-categories-settings">
                            <h4>Block Categories</h4>
                            <div class="settings-buttons category-controls">
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

                        <div class="settings-section" id="gossip-settings">
                            <h4>Gossip Monitor</h4>
                            <div class="settings-control-stack">
                                <div class="settings-control-row">
                                    <span class="toggle-label">Highlight qualifying comment counts:</span>
                                    <label class="switch">
                                        <input type="checkbox" id="comment-highlight-toggle" ${AppState.commentHighlightEnabled ? 'checked' : ''}>
                                        <span class="slider"></span>
                                    </label>
                                </div>    
                                <div class="settings-control-row">
                                    <span class="toggle-label">Do not block qualifying torrents: </span>
                                    <label class="switch">
                                        <input type="checkbox" id="comment-rescue-toggle" ${AppState.commentRescueEnabled ? 'checked' : ''}>
                                        <span class="slider"></span>
                                    </label>
                                </div>
                                <div class="settings-control-row settings-input-row">
                                    <label for="comment-rescue-threshold" class="toggle-label">Minimum comments required to trigger:</label>
                                    <input type="number" id="comment-rescue-threshold" class="settings-number-input" min="1" step="1" value="${AppState.commentRescueThreshold}" ${AppState.isCommentThresholdEnabled() ? '' : 'disabled'}>
                                </div>
                                <p class="settings-description">Highlighting only changes the appearance of the qualifying comment count. The blocking exemption bypasses matching title rules and blocked categories. </p>
                            </div>
                        </div>

                        <div class="settings-section" id="import-export-settings">
                            <h4>Custom Import/Export</h4>
                            <div class="settings-buttons">
                                <button id="import-btn" class="action-button" title="Import configuration from file">Import Configuration</button>
                                <button id="export-btn" class="action-button" title="Export configuration to file">Export Configuration</button>
                            </div>
                        </div>

                        <div class="settings-section" id="reset-settings">
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
                            <div>
                                <div id="notice-source" class="hb-announcement-source hb-hidden"></div>
                                <h4 id="notice-title">Notice</h4>
                            </div>
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
                    <div class="settings-header">
                        <h3>How to Use This Tool</h3>
                        <button class="close-x" id="help-close" title="Close">×</button>
                    </div>

                    <div class="settings-content">
                        <div class="settings-section">
                            <h4>What This Tool Does</h4>
                            <ul>
                                <li>Highlight: Makes matching titles stand out with a highlighted background</li>
                                <li>Block: Completely hides matching titles from view</li>
                            </ul>
                        </div>

                        <div class="settings-section">
                            <h4>How to Create a Rule</h4>
                            <ul>
                                <li>Type each word or phrase and press "Enter" to create a separate "chip"</li>
                                <li>You can click on any chip to edit it</li>
                                <li>Click the × on any chip to remove it</li>
                            </ul>
                        </div>

                        <div class="settings-section">
                            <h4>How Rule Logic Works</h4>
                            <ul>
                                <li>Must contain: ALL words/phrases must be found in a title (uses AND logic)</li>
                                <li>But not if it contains: If ANY of these words/phrases are found, the rule won't apply (uses OR logic)</li>
                                <li>Note: Non-latin characters are (hopefully) fully supported. This includes spaces, meaning you could do things like blocking "CR WEB-DL AVC" if so desired</li>
                                <li>Note: Matching is case-insensitive ("SubsPlease" is the same as "subsplease")</li>
                            </ul>
                        </div>

                        <div class="settings-section">
                            <h4>Examples</h4>
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
                        </div>

                        <div class="settings-section">
                            <h4>Further Settings</h4>
                            <ul>
                                <li>The "Enable" toggle in the top right turns the entire script on or off</li>
                                <li>Click the "⚙" (gear icon) in the top right, next to the close button, to access the following additional settings:</li>
                                <li class="help-list-item spaced">Highlight Colors: Customize the highlight colors for both light and dark themes</li>
                                <li class="help-list-item spaced">Auto-Import Rules: Instantly highlight common fansubber groups or block mini release groups, and receive automatic updates. Undesired groups can be removed</li>
                                <li class="help-list-item spaced">Block Categories: Block undesired categories (e.g. "Anime - Anime Music Video") when browsing the homepage or a category group. If you navigate directly to a category (e.g. filter specifically to show only "Anime - Anime Music Video"), it will not be hidden</li>
                                <li class="help-list-item spaced">Gossip Monitor: Make popular discussions easier to find. Highlight torrents with a high number of comments and/or exempt them from blocking</li>
                                <li class="help-list-item spaced">Custom Import/Export: Save your rules to a file for sharing or backup, or load previously saved configurations. On import you can choose to override all settings or only merge rules</li>
                                <li class="help-list-item spaced">Reset Settings: Restart from scratch. Will reset all configured highlights, blocks, and other settings. Consider exporting your configuration before performing a reset</li>
                            </ul>
                        </div>
                    </div>
                </div>

            `;
        },

        createOpenButton() {
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

        bindEvents() {
            window.addEventListener('resize', () => {
                this.updateContainerWidth();
                this.syncListHeights();
            });

            document.addEventListener('click', (event) => {
                this.handleDocumentClick(event);
            });

            setTimeout(() => {
                this.bindButtonEvents();
            }, 100);
        },

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

        handleDocumentClick(event) {
            // Page-level modals sit outside the GUI but should not close it.
            if (event.target.closest('.hb-modal-overlay')) {
                return;
            }

            if (event.target.classList.contains('chip-remove')) {
                return;
            }

            if (event.target.id === 'highlight-cancel-container' ||
                event.target.id === 'block-cancel-container') {
                return;
            }

            if (!this.guiContainer.contains(event.target) &&
                this.openButton && !this.openButton.contains(event.target)) {
                this.guiContainer.style.display = 'none';
            }
        },

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

            const commentRescueToggle = document.getElementById('comment-rescue-toggle');
            const commentHighlightToggle = document.getElementById('comment-highlight-toggle');
            const commentRescueThreshold = document.getElementById('comment-rescue-threshold');
            const syncCommentThresholdState = () => {
                if (commentRescueThreshold) {
                    commentRescueThreshold.disabled = !AppState.isCommentThresholdEnabled();
                }
            };

            if (commentRescueToggle) {
                commentRescueToggle.addEventListener('change', (event) => {
                    AppState.commentRescueEnabled = event.target.checked;
                    AppState.saveCommentSettings();
                    syncCommentThresholdState();
                    updateDisplay();
                });
            }

            if (commentHighlightToggle) {
                commentHighlightToggle.addEventListener('change', (event) => {
                    AppState.commentHighlightEnabled = event.target.checked;
                    AppState.saveCommentSettings();
                    syncCommentThresholdState();
                    updateDisplay();
                });
            }

            if (commentRescueThreshold) {
                commentRescueThreshold.addEventListener('change', (event) => {
                    AppState.commentRescueThreshold = normalizeCommentThreshold(event.target.value);
                    event.target.value = AppState.commentRescueThreshold;
                    AppState.saveCommentSettings();
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
                            'Do you want to remove recorded auto-imported fansubber rules from Highlights?\n' +
                            'You can then optionally remove untracked preset matches from older versions; ' +
                            'those may include manually added rules.',
                        showCancel: true,
                        okText: 'Yes',
                        cancelText: 'No'
                    }).then(async (confirmed) => {
                        if (!confirmed) return;
                        await removeAutoImportedRules('highlight');
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
                            'Do you want to remove recorded auto-imported mini rules from Blocks?\n' +
                            'You can then optionally remove untracked preset matches from older versions; ' +
                            'those may include manually added rules.',
                        showCancel: true,
                        okText: 'Yes',
                        cancelText: 'No'
                    }).then(async (confirmed) => {
                        if (!confirmed) return;
                        await removeAutoImportedRules('block');
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

            document.addEventListener('click', (event) => {
                if (settingsOverlay &&
                    settingsOverlay.style.display === 'block' &&
                    !settingsOverlay.contains(event.target) &&
                    !settingsBtn.contains(event.target)) {
                    settingsOverlay.style.display = 'none';
                    document.body.classList.remove('color-picker-active');
                }
            });

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

            const selectAllBtn = document.getElementById('select-all-categories');
            if (selectAllBtn) {
                selectAllBtn.addEventListener('click', () => {
                    AppState.blockedCategories = Object.keys(CATEGORIES);
                    AppState.saveBlockedCategories();

                    categoryCheckboxes.forEach(checkbox => {
                        checkbox.checked = true;
                    });

                    updateDisplay();
                });
            }

            const selectNoneBtn = document.getElementById('select-none-categories');
            if (selectNoneBtn) {
                selectNoneBtn.addEventListener('click', () => {
                    AppState.blockedCategories = [];
                    AppState.saveBlockedCategories();

                    categoryCheckboxes.forEach(checkbox => {
                        checkbox.checked = false;
                    });

                    updateDisplay();
                });
            }

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

        initializeChipInputs() {
            this.chipInputs = {
                highlightKeyword: new ChipInput('highlight-keyword-container', 'Add word or phrase to highlight'),
                highlightException: new ChipInput('highlight-exception-container', 'Add word or phrase to exclude from highlight'),
                blockKeyword: new ChipInput('block-keyword-container', 'Add word or phrase to block'),
                blockException: new ChipInput('block-exception-container', 'Add word or phrase to exclude from block')
            };
        },

        syncListHeights() {
            const highlightList = document.getElementById('keywords-highlight-list');
            const blockList = document.getElementById('keywords-block-list');

            if (!highlightList || !blockList) return;

            highlightList.style.height = 'auto';
            blockList.style.height = 'auto';

            const highlightHeight = highlightList.offsetHeight;
            const blockHeight = blockList.offsetHeight;

            const maxHeight = Math.max(highlightHeight, blockHeight);
            highlightList.style.height = `${maxHeight}px`;
            blockList.style.height = `${maxHeight}px`;
        }
    };

    // Rule lists

    const updateRuleLists = () => {
        updateHighlightRuleList();
        updateBlockRuleList();
        updateBlacklistLists();
        UI.syncListHeights();
    };

    const updateHighlightRuleList = () => {
        const list = document.getElementById('keywords-highlight-list');
        if (!list) return;

        list.replaceChildren();

        AppState.keywordsHighlight.forEach(([keywordParts, exceptionParts], index) => {
            const isAuto = isAutoImportedRule('highlight', keywordParts, exceptionParts);
            if ((!AppState.showAutoRules && isAuto) || (!AppState.showManualRules && !isAuto)) {
                return;
            }
            const listItem = createRuleListItem('highlight', index, keywordParts, exceptionParts);
            list.appendChild(listItem);
        });
    };

    const updateBlockRuleList = () => {
        const list = document.getElementById('keywords-block-list');
        if (!list) return;

        list.replaceChildren();

        AppState.keywordsBlock.forEach(([keywordParts, exceptionParts], index) => {
            const isAuto = isAutoImportedRule('block', keywordParts, exceptionParts);
            if ((!AppState.showAutoRules && isAuto) || (!AppState.showManualRules && !isAuto)) {
                return;
            }
            const listItem = createRuleListItem('block', index, keywordParts, exceptionParts);
            list.appendChild(listItem);
        });
    };

    const updateBlacklistLists = () => {
        updateBlacklistList('fansubbers');
        updateBlacklistList('minis');
    };

    const updateBlacklistList = (type) => {
        const list = document.getElementById(`${type}-blacklist-list`);
        if (!list) return;

        list.replaceChildren();

        const rules = type === 'fansubbers' ? AppState.fansubbersBlacklist : AppState.minisBlacklist;
        rules.forEach(([keywordParts, exceptionParts], index) => {
            const listItem = createBlacklistListItem(type, index, keywordParts, exceptionParts);
            list.appendChild(listItem);
        });
    };

    const createBlacklistListItem = (type, index, keywordParts, exceptionParts) => {
        const keywordChips = keywordParts
            .filter(k => k && k.trim())
            .map(k => `<span class="colored-chip green-chip">${escapeHtml(k)}</span>`)
            .join('');

        const exceptionChips = exceptionParts
            .filter(e => e && e.trim())
            .map(e => `<span class="colored-chip red-chip">${escapeHtml(e)}</span>`)
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
                const idx = Number.parseInt(removeBtn.dataset.index, 10);
                const ruleType = removeBtn.dataset.type;
                removeBlacklistRule(ruleType, idx);
            });
        }

        return li;
    };

    const createRuleListItem = (type, index, keywordParts, exceptionParts) => {
        const isEditing = AppState.editMode.isEditing &&
            AppState.editMode.type === type &&
            AppState.editMode.index === index;

        const keywordChips = keywordParts
            .filter(k => k && k.trim())
            .map(k => `<span class="colored-chip green-chip">${escapeHtml(k)}</span>`)
            .join('');

        const exceptionChips = exceptionParts
            .filter(e => e && e.trim())
            .map(e => `<span class="colored-chip red-chip">${escapeHtml(e)}</span>`)
            .join('');

        const presetBadge = isAutoImportedRule(type, keywordParts, exceptionParts)
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

        bindRuleItemEvents(li, type);

        return li;
    };

    const bindRuleItemEvents = (listItem, type) => {
        const editBtn = listItem.querySelector(`.${type}-edit-btn`);
        const removeBtn = listItem.querySelector(`.${type}-remove-btn`);

        if (editBtn) {
            editBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                if (!editBtn.disabled) {
                    const index = Number.parseInt(editBtn.dataset.index, 10);
                    enterEditMode(type, index);
                }
            });
        }

        if (removeBtn) {
            removeBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                if (!removeBtn.disabled) {
                    const index = Number.parseInt(removeBtn.dataset.index, 10);
                    removeRule(type, index);
                }
            });
        }
    };

    // Initialization

    const init = () => {
        try {
            sortRules(AppState.fansubbersBlacklist);
            sortRules(AppState.minisBlacklist);
            UI.init();
            showLatestUpdateAnnouncement();

            const fansubberChanges = autoImportFansubbers() || 0;
            const miniChanges = autoImportMinis() || 0;
            if (fansubberChanges > 0 || miniChanges > 0) {
                updateRuleLists();
            }

            updateDisplay();
            initThemeAndNyaaBlueMonitoring();
        } catch (error) {
            console.error('Failed to initialize Nyaa Highlight & Block script:', error);
        }
    };


    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
