import { api } from '../api.js';
export default (host) => ({
    addGroupMembers: (groupId, usernames, actingUser) => discourse(`${host}/groups/${groupId}/members.json`, {
        method: 'put',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'Api-Username': actingUser === 'admin' ? undefined : actingUser,
        },
        body: { usernames: usernames.join(',') },
    }),
    addGroupOwners: (groupId, usernames, actingUser) => discourse(`${host}/groups/${groupId}/owners.json`, {
        method: 'put',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'Api-Username': actingUser === 'admin' ? undefined : actingUser,
        },
        body: { usernames: usernames.join(',') },
    }),
    createGroup: (group) => discourse(`${host}/admin/groups.json`, {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
        },
        body: { group },
    }),
    group: (groupName) => discourse(`${host}/groups/${groupName}.json`),
    groupMembers: (groupName) => discourse(`${host}/groups/${groupName}/members.json`),
    privateMessage: (fromUsername, toUsername, subject, message) => discourse(`${host}/posts.json`, {
        method: 'post',
        headers: {
            'Api-Username': fromUsername,
            'Content-Type': 'application/json',
        },
        body: {
            title: subject,
            raw: message,
            target_recipients: toUsername,
            archetype: 'private_message',
        },
    }),
    removeGroupMembers: (groupId, usernames, actingUser) => discourse(`${host}/groups/${groupId}/members.json`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'Api-Username': actingUser === 'admin' ? undefined : actingUser,
        },
        body: { usernames: usernames.join(',') },
    }),
    replyToTopic: (topicId, message) => discourse(`${host}/groups/posts.json`, {
        method: 'post',
        body: {
            topic_id: topicId,
            raw: message,
        },
    }),
    search: (query) => discourse(`${host}/search/query?term=${query}`, {
        headers: { Accept: 'application/json' },
    }),
    user: (user) => {
        return typeof user === 'number'
            ? discourse(`${host}/admin/users/${user}.json`)
            : discourse(`${host}/u/${user}.json`);
    },
});
const discourse = (url, options = null) => {
    const apiKey = process.env.DISCOURSE_KEY;
    const apiUsername = process.env.DISCOURSE_ADMIN_USERNAME;
    const _options = options ?? {};
    _options.headers = {
        ...options?.headers,
        'Api-Key': apiKey,
    };
    if (!_options.headers['Api-Username']) {
        _options.headers['Api-Username'] = apiUsername;
    }
    const _url = url instanceof URL ? url : new URL(url);
    return api(_url, _options);
};
export var GroupVisibility;
(function (GroupVisibility) {
    GroupVisibility[GroupVisibility["Everyone"] = 0] = "Everyone";
    GroupVisibility[GroupVisibility["LoggedOnUser"] = 1] = "LoggedOnUser";
    GroupVisibility[GroupVisibility["OwnersMembersModerators"] = 2] = "OwnersMembersModerators";
    GroupVisibility[GroupVisibility["OwnersModerators"] = 3] = "OwnersModerators";
    GroupVisibility[GroupVisibility["Owners"] = 4] = "Owners";
})(GroupVisibility = GroupVisibility || (GroupVisibility = {}));
export var MessageableLevel;
(function (MessageableLevel) {
    MessageableLevel[MessageableLevel["Nobody"] = 0] = "Nobody";
    MessageableLevel[MessageableLevel["Admins"] = 1] = "Admins";
    MessageableLevel[MessageableLevel["AdminsModerators"] = 2] = "AdminsModerators";
    MessageableLevel[MessageableLevel["AdminsModeratorsMembers"] = 3] = "AdminsModeratorsMembers";
    MessageableLevel[MessageableLevel["AdminsModeratorsOwners"] = 4] = "AdminsModeratorsOwners";
    MessageableLevel[MessageableLevel["Everyone"] = 99] = "Everyone";
})(MessageableLevel = MessageableLevel || (MessageableLevel = {}));
//# sourceMappingURL=discourse.js.map