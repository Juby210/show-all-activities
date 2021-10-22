// Internals
const { getModule, getModuleByDisplayName, i18n: { Messages }, React } = require('powercord/webpack');
const { Button, Tooltip } = require('powercord/components');
const { inject, uninject } = require('powercord/injector');
const { findInReactTree } = require('powercord/util');
const { Plugin } = require('powercord/entities');

// Components
const CollapsibleActivity = require('./components/CollapsibleActivity');
const Settings = require('./components/Settings');

// Modules
const Arrow = getModule(m => m.displayName === 'Arrow' && !m.prototype?.render, false);
const { getGame, getGameByName } = getModule(['getGame', 'getGameByName'], false) || {};
const UserActivity = getModuleByDisplayName('UserActivity', false);
const { getActivities } = getModule(['getActivities', 'getUserIds'], false) || {};
const classes = getModule(['iconButtonSize'], false);

// Utility
let temp;
const filterActivities = (a, i) => {
   if (i === 0) temp = [];
   if (temp.includes(a.application_id || a.name)) return false;
   temp.push(a.application_id || a.name);
   return a.type !== 4;
};

const _getGame = a => getGame(a.application_id) || getGameByName(a.name);

module.exports = class ShowAllActivities extends Plugin {
   async startPlugin() {
      this.loadStylesheet('style.css');

      powercord.api.settings.registerSettings(this.entityID, {
         category: this.entityID,
         label: 'Show All Activities',
         render: Settings
      });

      inject('show-all-activities-pre', UserActivity.prototype, 'render', function (args) {
         if (this.props.__saa || this.props.type === 'Profile') return args;

         const activities = getActivities(this.props.user.id).filter(filterActivities);
         if (!activities || !activities.length) return args;

         if (!this.state) {
            this.state = {
               activity: activities.indexOf(this.props.activity)
            };
         } else {
            const activity = activities[this.state.activity];
            if (!activity) return args;

            this.props.activity = activity;
            this.props.game = _getGame(activity);

            if (this.state.activity > 0 && this.props.streamingGuild) {
               this.props._streamingGuild = this.props.streamingGuild;
               delete this.props.streamingGuild;
            } else if (this.state.activity === 0 && this.props._streamingGuild) {
               this.props.streamingGuild = this.props._streamingGuild;
            }
         }

         return args;
      }, true);

      const _this = this;
      inject('show-all-activities', UserActivity.prototype, 'render', function (_, res) {
         if (this.props.type === 'Profile') return res;
         if (this.props.__saa || this.state?.activity > 0) {
            const actions = findInReactTree(res, c => c && c.onOpenConnections);
            if (actions) {
               actions.activity = this.props.activity;
               delete actions.applicationStream;
            }

            const icon = findInReactTree(res, c => c && c.className && c.game);
            if (icon) icon.game = this.props.game;
         }

         if (this.props.__saa) {
            res = res.props.children;
            return res;
         }

         const activities = getActivities(this.props.user.id).filter(filterActivities);
         const collapsible = _this.settings.get('collapsibleActivities');
         if (
            !res?.props?.children ||
            !activities ||
            !activities.length ||
            collapsible && activities.length <= 1
         ) return res;

         if (collapsible) {
            const opened = _this.settings.get('autoOpen', true);
            const openFirst = _this.settings.get('autoOpenFirst', true);

            res.props.children = activities.map((a, i) => {
               return (
                  <CollapsibleActivity
                     {...this.props}
                     activity={a}
                     game={_getGame(a)}
                     defaultOpened={(openFirst ? i == 0 : opened)}
                     i={i}
                  />
               );
            });

            return res;
         }

         const { children } = res.props.children[1].props;
         const marginClass = this.props.activity.details || this.props.activity.state ?
            `allactivities-margin${this.props.activity.type === 1 && this.props.source === 'Profile Modal' ? '2' : ''}`
            : '';

         if (this.state.activity != 0) {
            children.unshift(
               <Tooltip
                  className={['allactivities-left', marginClass].join(' ')}
                  text={Messages.PAGINATION_PREVIOUS}
               >
                  <Button
                     className={classes.iconButtonSize}
                     size={Button.Sizes.MIN}
                     color={Button.Colors.WHITE}
                     look={Button.Looks.OUTLINED}
                     onClick={() => this.setState({ activity: this.state.activity - 1 })}
                  >
                     <Arrow direction='LEFT' />
                  </Button>
               </Tooltip>
            );
         }

         if (this.state.activity < activities.length - 1) {
            children.push(
               <Tooltip
                  className={['allactivities-left', marginClass].join(' ')}
                  text={Messages.NEXT}
               >
                  <Button
                     className={classes.iconButtonSize}
                     size={Button.Sizes.MIN}
                     color={Button.Colors.WHITE}
                     look={Button.Looks.OUTLINED}
                     onClick={() => this.setState({ activity: this.state.activity + 1 })}
                  >
                     <Arrow direction='RIGHT' />
                  </Button>
               </Tooltip>
            );
         }

         return res;
      });
   };

   pluginWillUnload() {
      powercord.api.settings.unregisterSettings(this.entityID);
      uninject('show-all-activities-pre');
      uninject('show-all-activities');
   }
};
