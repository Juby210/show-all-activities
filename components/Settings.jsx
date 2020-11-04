const { React } = require('powercord/webpack')
const { SwitchItem } = require('powercord/components/settings')

module.exports = class Settings extends React.PureComponent {
    render() {
        return <SwitchItem
            value={this.props.getSetting('collapsibleActivities')}
            onChange={() => this.props.toggleSetting('collapsibleActivities')}
            note='Show activities as collapsible "categories" (only works with ≥2 activities)'
        >Collapsible Activities</SwitchItem>
    }
}
