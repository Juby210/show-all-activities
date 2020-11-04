const { React, getModuleByDisplayName } = require('powercord/webpack')
const { Icon } = require('powercord/components')
const UserActivity = getModuleByDisplayName('UserActivity', false)

module.exports = class CollapsibleActivity extends React.PureComponent {
    constructor(props) {
        super(props)
        this.state = {}
    }

    render() {
        const header = UserActivity.prototype.renderHeader.apply({ props: {}, activity: this.props.activity })
        header.props.children.push(<Icon name={`ArrowDrop${this.state.opened ? 'Up' : 'Down'}`} style={{ marginLeft: 'auto' }} />)
        header.props.onClick = () => this.setState({ opened: !this.state.opened })
        header.props.className += ' allactivities-collapsibleheader'
        if (!this.state.opened) {
            if (!header.props.children.find(c => c?.includes && c.includes(this.props.activity.name)))
                header.props.children.splice(header.props.children.length - 1, 0, ' ' + this.props.activity.name)
            return header
        }
        return <>
            {header}
            <UserActivity __saa={true} {...this.props} hideHeader={true} />
        </>
    }
}
