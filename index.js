const { Plugin } = require('powercord/entities')
const { getModule, getModuleByDisplayName, i18n: { Messages }, React } = require('powercord/webpack')
const { Button, Icon, Tooltip } = require('powercord/components')
const { findInReactTree } = require('powercord/util')
const { inject, uninject } = require('powercord/injector')

const CollapsibleActivity = require('./components/CollapsibleActivity')
const Settings = require('./components/Settings')

let temp
const filterActivities = (a, i) => {
    if (i == 0) temp = []
    if (temp.includes(a.application_id || a.name)) return false
    temp.push(a.application_id || a.name)
    return a.type != 4
}

module.exports = class ShowAllActivities extends Plugin {
    async startPlugin() {
        this.loadStylesheet('style.css')
        powercord.api.settings.registerSettings(this.entityID, {
            category: this.entityID,
            label: 'Show All Activities',
            render: Settings
        })
        const classes = await getModule(['iconButtonSize'])
        const { getActivities } = await getModule(['getActivities'])
        const { getGame } = await getModule(['getGame', 'getGameByName'])
        const UserActivity = await getModuleByDisplayName('UserActivity')

        inject('show-all-activities-pre', UserActivity.prototype, 'render', function (args) {
            if (this.props.__saa) return args
            const activities = getActivities(this.props.user.id).filter(filterActivities)
            if (!activities || !activities.length) return args
            if (!this.state) this.state = { activity: activities.indexOf(this.props.activity) }
            else {
                const activity = activities[this.state.activity]
                if (!activity) return args
                this.props.activity = activity
                this.props.game = getGame(activity.application_id)
            }
            return args
        }, true)

        const _this = this
        inject('show-all-activities', UserActivity.prototype, 'render', function (_, res) {
            if (this.props.__saa) {
                res = res.props.children
                const actions = findInReactTree(res, c => c && c.onOpenConnections)
                if (actions) actions.activity = this.props.activity
                return res
            }

            const activities = getActivities(this.props.user.id).filter(filterActivities)
            const collapsible = _this.settings.get('collapsibleActivities')
            if (!res?.props?.children || !activities || !activities.length || collapsible && activities.length <= 1) return res
            if (collapsible) {
                const defaultOpened = _this.settings.get('autoOpen')
                res.props.children = activities.map(a => React.createElement(CollapsibleActivity, {
                    ...this.props, activity: a, game: getGame(a.application_id), defaultOpened
                }))
                return res
            }

            const { children } = res.props.children[1].props
            const marginClass = this.props.activity.details || this.props.activity.state ?
                ` allactivities-margin${this.props.activity.type == 1 && this.props.source == 'Profile Modal' ? '2' : ''}`
                : ''

            if (this.state.activity != 0) children.unshift(React.createElement(Tooltip, {
                className: `allactivities-left${marginClass}`,
                text: Messages.PAGINATION_PREVIOUS
            }, React.createElement(Button, {
                className: classes.iconButtonSize,
                size: Button.Sizes.MIN,
                color: Button.Colors.WHITE,
                look: Button.Looks.OUTLINED,
                onClick: () => this.setState({ activity: this.state.activity - 1 })
            }, React.createElement(Icon, { direction: 'LEFT', name: 'Arrow' }))))
            if (this.state.activity < activities.length - 1) children.push(React.createElement(Tooltip, {
                className: `allactivities-right${marginClass}`,
                text: Messages.NEXT
            }, React.createElement(Button, {
                className: classes.iconButtonSize,
                size: Button.Sizes.MIN,
                color: Button.Colors.WHITE,
                look: Button.Looks.OUTLINED,
                onClick: () => this.setState({ activity: this.state.activity + 1 })
            }, React.createElement(Icon, { direction: 'RIGHT', name: 'Arrow' }))))

            const actions = findInReactTree(res.props, c => c && c.onOpenConnections)
            if (actions) actions.activity = this.props.activity
            return res
        })
    }

    pluginWillUnload() {
        powercord.api.settings.unregisterSettings(this.entityID)
        uninject('show-all-activities-pre')
        uninject('show-all-activities')
    }
}
