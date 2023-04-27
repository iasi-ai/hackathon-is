'use strict';

/**
 * Dialog.js is a multipurpose lightweight highly configurable dialog library.
 *
 * @author Eugen Bușoiu
 * @link https://github.com/eugenb/dialog.js
 *
 * @licence MIT <https://raw.githubusercontent.com/eugenb/dialog.js/master/LICENSE>
 */
class Dialog {

    /**
     * Dialog constructor.
     *
     * @param body Dialog content
     * @param args Dialog arguments
     */
    constructor(body, args) {

        // Default options
        this.options = {

            // Styling classes
            dialogClassName: null,
            dialogPlaceholderClassName: null,

            // Size
            size: {
                x: 0,
                y: 0
            },
            position: {},

            // Automatically trigger dialog show
            autoShow: true,

            // Events
            autoClose: false,
            closeOnEsc: true,
            closeOnOutsideClick: true,

            // Callbacks
            callback: {
                onBeforeShow: null,
                onShow: null,
                onClose: null
            },

            // Attach dialog relative to element
            linkTo: null
        };

        // Extend options
        this.options = Object.assign(this.options, args);

        // Create dialog
        this.create(body);
    }

    /**
     * Checks if given element is a child of given dialog.
     *
     * @param elem Element
     * @param dialog Dialog parent
     * @return {boolean}
     */
    static isChild(elem, dialog) {

        // Get descendents
        let d = dialog.getElementsByTagName('*');
        for (let i = 0; i < d.length; i++) {
            if (d[i] === elem) {
                return true;
            }
        }
        return false;
    }

    /**
     * Close all open dialogs.
     */
    static closeAll() {

        // Close all open dialogs
        document.querySelectorAll('[dialog-id]').forEach(dlg => {
            if (typeof dlg.close === 'function') {
                dlg.close();
            }
        });
    }

    /**
     * Creates dialog.
     *
     * @param body Dialog content
     */
    create(body) {

        // Elements
        this.dlg = document.createElement('div');
        this.dlgPlaceholder = document.createElement('div');

        // Apply default classes
        this.dlgPlaceholder.classList.add('dialog-placeholder');
        this.dlg.classList.add('dialog');

        // Apply given classes
        if (this.options.dialogPlaceholderClassName !== null) {
            this.dlgPlaceholder.classList.add(this.options.dialogPlaceholderClassName);
        }

        if (this.options.dialogClassName !== null) {
            this.dlg.classList.add(this.options.dialogClassName);
        }

        // Set dialog placeholder attributes
        this.dlgPlaceholder.setAttribute('dialog-id', Math.random().toString(36).substring(2, 9));
        this.dlgPlaceholder.style.visibility = 'hidden';

        // Set dialog attributes
        this.dlg.setAttribute('dialog-id', Math.random().toString(36).substring(2, 9));

        // Set dialog body
        this.dlg.innerHTML = body;

        // Append dialog
        document.body.appendChild(this.dlgPlaceholder);

        // Calculate viewport size(s)
        let viewportWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth || 0,
            viewportHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight || 0;

        // Render dialog attached to an existing element
        if (this.options.linkTo !== null) {

            // Move dialog next to linkTo element
            this.options.linkTo.parentNode.insertBefore(this.dlg, this.options.linkTo.nextSibling);

            // Set position coordinates based on linked element coords
            this.dlg.style.marginLeft = this.options.position.x !== undefined ? `${this.options.position.x}px` : 0;
            this.dlg.style.marginTop = this.options.position.y !== undefined ? `${this.options.position.y}px` : 0;
        } else {

            // Append dialog to placeholder
            this.dlgPlaceholder.appendChild(this.dlg);

            // Get dialog width
            const dlgStyle = getComputedStyle(this.dlg),
                dlgStyleWidth = dlgStyle.getPropertyValue('width'),
                dlgStyleHeight = dlgStyle.getPropertyValue('height');

            // Calculate sizes
            this.options.size = {
                x: dlgStyleWidth.match(/px/) ?
                    parseInt(dlgStyleWidth.replace(/px/, '')) :
                    dlgStyleWidth.match(/%/) ? (viewportWidth * parseInt(dlgStyleWidth.replace(/%/, ''))) / 100 : this.dlg.offsetWidth,
                y: dlgStyleHeight.match(/px/) ?
                    parseInt(dlgStyleHeight.replace(/px/, '')) :
                    dlgStyleHeight.match(/%/) ? (viewportHeight * parseInt(dlgStyleHeight.replace(/%/, ''))) / 100 : this.dlg.offsetHeight
            };

            // Set position coordinates based on provided values
            this.dlg.style.marginLeft = this.options.position.x !== undefined ? `${this.options.position.x}px` :
                `${(viewportWidth - parseInt(this.options.size.x)) / 2}px`;

            this.dlg.style.marginTop = this.options.position.y !== undefined ? `${this.options.position.y}px` :
                `${(viewportHeight - parseInt(this.options.size.y)) / 2}px`;
        }

        // AutoClose
        if (this.options.autoClose) {
            setTimeout(() => {
                this.close()
            }, parseInt(this.options.autoClose) * 1000);
        }

        // Close dialog on escape
        if (this.options.closeOnEsc) {
            document.addEventListener('keyup', e => {

                let key = e.code,
                    target = e.target;

                if (target.nodeType === 3) {
                    target = target.parentNode;
                }

                if (!/(ArrowUp|ArrowDown|Escape|Space)/.test(key) || /input|textarea/i.test(target.tagName)) {
                    return;
                }

                if (key === 'Escape' && this.isVisible()) {
                    this.close();
                }
            });
        }

        // Close dialog when outside click
        if (this.options.closeOnOutsideClick) {
            this.dlgPlaceholder.addEventListener('click', e => {

                let target = e.target;

                if (this.isVisible() && target !== this.dlg && !Dialog.isChild(target, this.dlg)) {
                    this.close();
                }
            });
        }

        // Show dialog (if autoShow is true)
        if (this.options.autoShow) {
            this.show();
        }
    }

    /**
     * Checks if dialog is visible.
     *
     * @return {boolean}
     */
    isVisible() {
        return this.dlgPlaceholder && (this.dlgPlaceholder.style.visibility === 'visible');
    }

    /**
     * Checks if dialog has been created.
     *
     * @return {boolean}
     */
    isCreated() {
        return this.dlgPlaceholder !== null;
    }

    /**
     * Closes dialog.
     */
    close() {
        // Remove dialog
        if (this.isVisible()) {

            // Trigger onClose callback
            if (typeof this.options.callback.onClose === 'function') {
                this.options.callback.onClose();
            }

            // Remove dialog
            this.dlg.parentNode.removeChild(this.dlg);

            // Remove dialog placeholder
            this.dlgPlaceholder.parentNode.removeChild(this.dlgPlaceholder);
            this.dlgPlaceholder = null;
        }
    }

    /**
     * Show dialog (if hidden)
     */
    show() {
        // Trigger onBeforeShow callback
        if (typeof this.options.callback.onBeforeShow === 'function') {
            this.options.callback.onBeforeShow();
        }

        // Show dialog
        this.dlgPlaceholder.style.visibility = 'visible';

        // Trigger onBeforeShow callback
        if (typeof this.options.callback.onShow === 'function') {
            this.options.callback.onShow();
        }
    }
}

/**
 * Hackathon Iași
 * Powered by IAȘI AI community
 *
 * @copyright (c) 2023 IAȘI AI. All rights reserved.
 * @link https://hackathon.is
 * @link https://iasi.ai
 */
const app = (() => {

    /**
     * Spinner elem.
     * @type {string}
     */
    const spinner = `<div class="spinner spinner-sm"></div>`;

    /**
     * Call API endpoint.
     *
     * @param url
     * @param method
     * @param body
     * @return {Promise<Response>}
     */
    async function apiCall(url, method = 'GET', body = '') {

        // Prepare API call
        const apiCall = {
            method: method, headers: {
                'Accept': 'application/json', 'Content-Type': 'application/json'
            }, body: body ? JSON.stringify(body) : ''
        };

        // POST request?
        if (method === 'GET' || method === 'HEAD') {
            delete apiCall.body;
        }

        return await fetch(url, apiCall);
    }

    /**
     * Get route path.
     * @return {{}}
     */
    function getRoutePath() {

        const map = ['route', 'method', 'query'], path = window.location.pathname, hash = window.location.hash, route = {};

        // Populate path data
        if (path) {
            let tokens = path.replace(/^\/?|\/?$/g, '').split('/');
            if (tokens.length > 0) {

                for (let i = 0; i < map.length; i++) {
                    route[map[i]] = tokens[i];
                }
            }
        }

        // Populate hash
        if (hash) {
            route['hash'] = hash.substring(1);
        }

        return route;
    }

    /**
     * Menu slider (for mobile phones and tablets).
     */
    function menuSlider() {

        // Slide menu trigger and menu container
        let slideMenuTrigger = document.querySelector('.btn-menu'),
            slideMenu = document.querySelector('.slide-menu');

        if (slideMenuTrigger !== null && slideMenu !== null) {
            slideMenuTrigger.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                // Slide dialog
                const dlg = new Dialog(`<div class="container">${slideMenu.innerHTML}</div>`, {
                    dialogClassName: 'slide-menu-dialog',
                    dialogPlaceholderClassName: 'dialog-placeholder',
                    position: {
                        x: 0,
                        y: 0
                    },
                    callback: {
                        onShow: () => {
                            slideMenuTrigger.style.visibility = 'hidden';
                            document.body.classList.add('no-scroll');
                            document.querySelector('.logo').classList.add('logo-slide-menu');
                        },
                        onClose: () => {
                            slideMenuTrigger.style.visibility = 'visible';
                            document.body.classList.remove('no-scroll');
                            document.querySelector('.logo').classList.remove('logo-slide-menu');
                        }
                    }
                });

                // Attach event on slide close
                let slideMenuCloseButton = dlg.dlg.querySelector('button.btn-slide-close');
                if (slideMenuCloseButton) {
                    slideMenuCloseButton.addEventListener('click', (e) => {

                        // Prevent default
                        e.preventDefault();
                        e.stopPropagation();

                        // Close dialog
                        dlg.close();
                    });
                }
            });
        }
    }

    /**
     * Render dialogs.
     * @param dialog
     * @param callback
     */
    function renderModal(dialog, callback = null) {

        // Get dialogs
        const dialogAction = document.querySelectorAll(dialog);
        if (dialogAction.length > 0) {
            dialogAction.forEach((d) => {

                // Get dialog ref
                let dialogRef = d.getAttribute('data-dlg'),
                    dialogBody = document.querySelector(dialogRef);

                if (dialogRef && dialogBody) {
                    d.addEventListener('click', () => {

                        // Close all previous dialogs
                        Dialog.closeAll();

                        // Create dialog
                        const dlg = new Dialog(dialogBody.innerHTML, {
                            dialogClassName: 'modal-dialog',
                            dialogPlaceholderClassName: 'dialog-placeholder',
                            closeOnEsc: true,
                            closeOnOutsideClick: false,
                            callback: {
                                onShow: () => {
                                    document.body.classList.add('no-scroll');
                                },
                                onClose: () => {
                                    document.body.classList.remove('no-scroll');
                                }
                            }
                        });

                        // Rename IDs of inputs with label associated
                        // Opening a section into a dialog creates duplicate elements and label for="" does not work properly
                        const labels = dlg.dlg.querySelectorAll('label[for]');
                        labels.forEach((label) => {

                            // Check if label has input associated
                            let labelForId = label.htmlFor;
                            let associatedElem = dlg.dlg.querySelector(`#${labelForId}`);

                            if (labelForId && associatedElem) {

                                // Generate unique ID
                                let ID = `elem${Math.random().toString(16).slice(2)}`;

                                associatedElem.id = ID;
                                label.htmlFor = ID;
                            }
                        });

                        // Callback
                        if (callback) {
                            callback(dlg, d.dataset || null);
                        }

                        // Close button action (if exists)
                        const closeButton = dlg.dlg.querySelector('.close-dialog');
                        if (closeButton) {
                            closeButton.addEventListener('click', (e) => {

                                // Prevent default
                                e.preventDefault();
                                e.stopPropagation();

                                // Close dialog
                                dlg.close();
                            });
                        }
                    });
                }
            });
        }
    }

    /**
     * Trigger notification rendering.
     *
     * @param container Notification placeholder
     * @param message Notification message
     * @param type (Optional) Notification type (error, info, success, warning)
     * @param autoHide (Optional) Auto hide notification after given seconds
     * @param floating (Optional) Render notification positioned bottom left of the window
     */
    function renderNotification(container, message, type = 'error', autoHide = 0, floating = false) {

        // Validate container
        if (container) {

            // Check if there are other notifications visible
            const activeNotifiers = container.querySelectorAll('.notification');

            // Prepare notification
            const notification = document.createElement('p');
            notification.classList.add('notification', 'notification-sm');

            // Clear existing class types
            notification.classList.remove('error', 'success', 'info', 'warning');

            // Add type
            notification.classList.add(type);

            // Add message
            notification.innerHTML = message;

            // Floating
            if (floating) {
                notification.classList.add('notification-floating', 'notification-animation');

                // If existing notification, move upper
                if (activeNotifiers.length > 0) {
                    notification.style.top = `${(activeNotifiers.length * 45) + 20}px`;
                }
            } else {

                // If existing notification, close it
                if (activeNotifiers.length > 0) {
                    container.innerHTML = '';
                }
            }

            // Append child
            container.appendChild(notification);

            // Auto hide message
            if (autoHide > 0) {

                // Hide notification after seconds
                setTimeout(() => {
                    notification.classList.remove('notification', 'notification-sm', 'notification-inline', 'notification-animation', 'notification-floating', 'error', 'success', 'info', 'warning');
                    notification.innerHTML = '';

                    // Remove child
                    notification.parentNode.removeChild(notification);
                }, (autoHide * 1000));
            }
        }
    }

    /**
     * Render hackathon page.
     *
     *  - Normalize first page height by calculating the difference between
     *    window inner height and header height.
     */
    function render() {

        // Email validation
        const validateEmail = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

        // Page
        const page = document.querySelector('.page');
        if (page) {

            // Get elements
            const header = page.querySelector('header'),
                sections = page.querySelectorAll('section.events'),
                buttonRegister = page.querySelectorAll('.btn-register');

            // Normalize level-1 elements heights
            if (header) {

                // Window height
                let windowInnerHeight = window.innerHeight;

                // Get header height
                let headerHeight = header.offsetHeight;

                // Set first section height
                if (sections[0] && window.screen.availWidth > 720) {
                    sections[0].style.minHeight = `${Math.round(windowInnerHeight - headerHeight)}px`;
                }
            }

            // Attach modal dialog event
            renderModal('.btn-register', (d) => {

                // Notification placeholder
                const notification = d.dlg.querySelector('.notification-placeholder');

                // Form
                const registrationForm = d.dlg.querySelector('form[name=registration]');
                registrationForm.addEventListener('submit', (e) => e.preventDefault());

                // Buttons
                const registrationSubmit = registrationForm.querySelector('input[type=submit]');

                // Handle registration type
                const registrationTypeIndividual = registrationForm.querySelector('input[name=registrationType][value=Individual]'),
                    registrationTypeTeam = registrationForm.querySelector('input[name=registrationType][value=Team]');

                // Containers
                const registrationTeamContainer = registrationForm.querySelector('.registrationTeam');
                const registrationAgreeToJoinTeam = registrationForm.querySelector('.agreeJoinTeam');

                // Inputs
                const registrationFirstName = registrationForm.querySelector('input[name=firstName]'),
                    registrationLastName = registrationForm.querySelector('input[name=lastName]'),
                    registrationEmail = registrationForm.querySelector('input[name=email]'),
                    registrationPhone = registrationForm.querySelector('input[name=phone]'),
                    registrationAgreeToBeInTeam = registrationForm.querySelector('input[name=agreePartOfTeam]');

                // Teams
                const registrationTeamName = registrationForm.querySelector('input[name=teamName]'),
                    teamContainer = registrationForm.querySelector('.team-container'),
                    teamMemberAdd = registrationForm.querySelector('button[name=teamMemberAdd]');

                // Challenge
                const registrationChallenge1 = registrationForm.querySelector('input#challenge1'),
                    registrationChallenge2 = registrationForm.querySelector('input#challenge2'),
                    registrationChallenge3 = registrationForm.querySelector('input#challenge3');

                // Terms and Conditions
                const registrationAgreeTerms = registrationForm.querySelector('input[name=agreeTerms]');

                // Handle registration type (Individual/Team)
                if (registrationTypeIndividual) {
                    registrationTypeIndividual.addEventListener('click', (e) => {
                        registrationTeamContainer.classList.add('hide');
                        registrationAgreeToJoinTeam.classList.remove('hide');
                    });
                }
                if (registrationTypeTeam) {
                    registrationTypeTeam.addEventListener('click', (e) => {
                        registrationTeamContainer.classList.remove('hide');
                        registrationAgreeToJoinTeam.classList.add('hide');
                    });
                }

                // Handle team registration
                if (teamContainer && teamMemberAdd) {
                    teamMemberAdd.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        // Get total number of entries
                        let membersCount = teamContainer.querySelectorAll('.teamMember').length;
                        if (membersCount < 6) {

                            // Generate unique ID for team member entry
                            let uniqueId = Date.now().toString();

                            // Create element
                            let frag = document.createDocumentFragment();
                            let fieldSet = document.createElement('fieldset');
                            fieldSet.classList.add('teamMember', 'form-group', 'form-group-inline', 'cols-5-5-2');
                            fieldSet.setAttribute('data-id', uniqueId);

                            let div1 = document.createElement('div');
                            let input1 = document.createElement('input');
                            input1.classList.add('form-control', 'form-control-2pbb');
                            input1.id = `teamMemberName.${membersCount}`;
                            input1.name = `teamMemberName.${membersCount}`;
                            input1.type = 'text';
                            input1.placeholder = 'Enter team member name';
                            div1.appendChild(input1);

                            let div2 = document.createElement('div');
                            let input2 = document.createElement('input');
                            input2.classList.add('form-control', 'form-control-2pbb');
                            input2.id = `teamMemberEmail.${membersCount}`;
                            input2.name = `teamMemberEmail.${membersCount}`;
                            input2.type = 'text';
                            input2.placeholder = 'Enter team member e-mail address';
                            div2.appendChild(input2);

                            let div3 = document.createElement('div');
                            let button = document.createElement('button');
                            button.classList.add('btn', 'btn-sm', 'btn-remove-entry');
                            button.id = `teamMemberDel.${membersCount}`;
                            button.name = `teamMemberDel.${membersCount}`;
                            button.setAttribute('data-id', uniqueId);
                            button.innerHTML = `<span data-icon="&#xe005;" class="ic-mr-5"></span> Remove`
                            div3.appendChild(button);

                            fieldSet.appendChild(div1);
                            fieldSet.appendChild(div2);
                            fieldSet.appendChild(div3);

                            teamContainer.appendChild(fieldSet);

                            teamContainer.querySelectorAll('button.btn-remove-entry').forEach((b) => {

                                // Has attached event
                                b.addEventListener('click', (e) => {
                                    let attr = b.getAttribute('data-id'),
                                        entry = teamContainer.querySelector(`.teamMember[data-id="${attr}"]`);

                                    entry.parentNode.removeChild(entry);
                                });
                            });
                        }
                    });
                }

                // Registration data object
                const data = {
                    type: null,
                    name: {
                        first: null,
                        last: null
                    },
                    email: null,
                    phone: null,
                    joinTeam: 0,
                    team: {
                        name: null,
                        members: []
                    },
                    challenge: 0,
                    termsConditions: 0
                };

                // Submit registration
                registrationSubmit.addEventListener('click', (e) => {

                    // Validations
                    try {

                        // Registration type
                        data.type = registrationTypeIndividual.checked ? 1 : 2;

                        // Validate first name and last name
                        if (registrationFirstName.value.length === 0 || registrationLastName.value.length === 0 || registrationEmail.value.length === 0 || registrationPhone.value.length === 0) {
                            throw `Please make sure all required fields are filled in.`;
                        } else if (!registrationEmail.value.match(validateEmail)) {
                            throw `E-mail address is invalid. Please use a different one.`;
                        } else {

                            // Registration contact details
                            data.name.first = registrationFirstName.value.trim();
                            data.name.last = registrationLastName.value.trim();
                            data.email = registrationEmail.value.trim();
                            data.phone = registrationPhone.value.trim();
                        }

                        // Individual registration
                        if (data.type === 1) {
                            data.joinTeam = registrationAgreeToBeInTeam.checked ? 1 : 0;
                        }

                        // Team registration
                        else if (data.type === 2) {

                            // Team name
                            if (registrationTeamName.value.length === 0) {
                                throw `Please make sure you provide a name for your team.`;
                            } else {
                                data.team.name = registrationTeamName.value.trim();
                            }

                            // Team members
                            // Get team members names
                            const teamMembers = teamContainer.querySelectorAll('.teamMember');
                            if (teamMembers.length === 0) {
                                throw `You haven't added any team members. Please add at least a team member or switch to individual registration.`;
                            } else {
                                teamMembers.forEach((el, i) => {
                                    const teamMemberId = el.getAttribute('data-id');

                                    if (teamMemberId) {
                                        const teamMemberName = el.querySelector(`input[name="teamMemberName.${i}"]`).value.trim();
                                        const teamMemberEmail = el.querySelector(`input[name="teamMemberEmail.${i}"]`).value.trim();

                                        if (teamMemberName.length === 0 || teamMemberEmail.length === 0) {
                                            throw `Team member name and e-mail address are mandatory.`;
                                        } else if (!teamMemberEmail.match(validateEmail)) {
                                            throw `Team member e-mail address for <strong>${teamMemberName}</strong> is invalid. Please use a different one.`;
                                        } else {
                                            data.team.members.push({
                                                name: teamMemberName,
                                                email: teamMemberEmail
                                            });
                                        }
                                    }
                                });
                            }
                        }

                        // Registration challenge
                        data.challenge = registrationChallenge1.checked ? 1 : (registrationChallenge2.checked ? 2 : registrationChallenge3.checked ? 3 : 0);
                        if (data.challenge === 0) {
                            throw `You haven't chosen the hackathon challenge.`;
                        }

                        // Terms & Conditions
                        data.termsConditions = registrationAgreeTerms.checked ? 1 : 0;
                        if (data.termsConditions === 0) {
                            throw `Terms and Conditions must be agreed in order to complete hackathon registration.`;
                        }

                        // Perform API call
                        app.api(`https://api.hackathon.is/api/registration/`, 'POST', {
                            action: 'registration',
                            value: data
                        }).then(response => {
                            return response.json();
                        }).then(json => {
                            if (json.error) {
                                throw json.message;
                            } else {

                                // Notify user
                                d.dlg.innerHTML = `<section class="registration-successful text-center"><span data-icon="&#xe001;" class="ic-colored ic-x3" style="--color:#28a745;"></span><h4>${json.message}</h4></section><nav class="form-buttons"><a href="#cancel" class="btn btn-cancel close-dialog">Close</a></nav>`;

                                // Close button action (if exists)
                                const closeButton = d.dlg.querySelector('.close-dialog');
                                if (closeButton) {
                                    closeButton.addEventListener('click', (e) => {

                                        // Prevent default
                                        e.preventDefault();
                                        e.stopPropagation();

                                        // Close dialog
                                        d.close();
                                    });
                                }
                            }
                        }).catch(err => {

                            // Notify user
                            renderNotification(notification, err, 'error', 10, true);
                        });

                    } catch (e) {
                        renderNotification(notification, e, 'error', 10, true);
                    }
                });
            });
        }
    }

    return {

        // Spinner
        spin: spinner,

        // API call
        api: apiCall,

        // Route path
        route: getRoutePath,

        // Menu slider
        menu: menuSlider,

        // Render page
        render: render

    };

})();

/**
 * Initialize app.
 */
(() => {

    // Render page
    app.render();

    // Menu slider
    app.menu();

})();