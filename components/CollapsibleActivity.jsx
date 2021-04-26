const { React, getModuleByDisplayName } = require('powercord/webpack')
const UserActivity = getModuleByDisplayName('UserActivity', false)

const Icons = {
    ArrowDropDown: getModuleByDisplayName('ArrowDropDown', false),
    ArrowDropUp: getModuleByDisplayName('ArrowDropUp', false)
}
const Icon = props => React.createElement(Icons[props.name], props)

module.exports = class CollapsibleActivity extends React.PureComponent {
    constructor(props) {
        super(props)
        this.state = { opened: props.defaultOpened }
    }

    render() {
        if (this.props.i > 0) delete this.props.streamingGuild

        const header = UserActivity.prototype.renderHeader.apply({ props: this.props, activity: this.props.activity })
        if (!Array.isArray(header?.props?.children)) return null
        header.props.children.push(<Icon name={`ArrowDrop${this.state.opened ? 'Up' : 'Down'}`} style={{ marginLeft: 'auto' }} />)
        header.props.onClick = () => this.setState({ opened: !this.state.opened })
        header.props.className += ' allactivities-collapsibleheader'

        if (!this.state.opened) {
            if (!header.props.children.find(c => c?.includes && c.includes(this.props.activity.name))) {
                if (header.props.children.find(c => c?.includes && c.includes('Playing a game'))) {
                    header.props.children.splice(header.props.children.length - 3, 1, `Playing ${this.props.activity.name}`)
                } else {
                    header.props.children.splice(header.props.children.length - 2, 0, ` ${this.props.activity.name}`)
                }
            }
            return header
        }
        return <>
            {header}
            <UserActivity __saa={true} {...this.props} hideHeader={true} />
        </>
    }
}
