const { Plugin } = require('powercord/entities')
const { getModule, getModuleByDisplayName, i18n: { Messages }, React } = require('powercord/webpack')
const { Button, Icon, Tooltip } = require('powercord/components')
const { findInReactTree } = require('powercord/util')
const { inject, uninject } = require('powercord/injector')

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
        const classes = await getModule(['iconButtonSize'])
        const { getActivities } = await getModule(['getActivities'])
        const { getGame } = await getModule(['getGame', 'getGameByName'])
        const UserActivity = await getModuleByDisplayName('UserActivity')

        // Icon component polyfill bcs v2 doesn't have it yet
        const Icon2 = Icon || (props => React.createElement(getModule(m => m.id && typeof m.keys === 'function' && m.keys().includes('./Activity'), false)('./' + props.name).default, props))

        inject('show-all-activities-pre', UserActivity.prototype, 'render', function (args) {
            const activities = getActivities(this.props.user.id).filter(filterActivities)
            if (!activities) return args
            if (!this.state) this.state = { activity: activities.indexOf(this.props.activity) }
            else {
                const activity = activities[this.state.activity]
                if (!activity) return args
                this.props.activity = activity
                this.props.game = getGame(activity.application_id)
            }
            return args
        }, true)

        inject('show-all-activities', UserActivity.prototype, 'render', function (_, res) {
            const activities = getActivities(this.props.user.id).filter(filterActivities)
            if (!res || !activities) return res
            const { children } = res.props.children[1].props
            const marginClass = this.props.activity.details || this.props.activity.state ? ' allactivities-margin' : ''

            if (this.state.activity != 0) children.unshift(React.createElement(Tooltip, {
                className: `allactivities-left${marginClass}`,
                text: Messages.PAGINATION_PREVIOUS
            }, React.createElement(Button, {
                className: classes.iconButtonSize,
                size: Button.Sizes.MIN,
                color: Button.Colors.WHITE,
                look: Button.Looks.OUTLINED,
                onClick: () => this.setState({ activity: this.state.activity - 1 })
            }, React.createElement(Icon2, { direction: 'LEFT', name: 'Arrow' }))))
            if (this.state.activity < activities.length - 1) children.push(React.createElement(Tooltip, {
                className: `allactivities-right${marginClass}`,
                text: Messages.NEXT
            }, React.createElement(Button, {
                className: classes.iconButtonSize,
                size: Button.Sizes.MIN,
                color: Button.Colors.WHITE,
                look: Button.Looks.OUTLINED,
                onClick: () => this.setState({ activity: this.state.activity + 1 })
            }, React.createElement(Icon2, { direction: 'RIGHT', name: 'Arrow' }))))

            const actions = findInReactTree(res.props, c => c && c.onOpenConnections)
            if (actions) actions.activity = this.props.activity
            return res
        })
    }

    pluginWillUnload() {
        uninject('show-all-activities-pre')
        uninject('show-all-activities')
    }
}
