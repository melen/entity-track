class EntityTrack {
    constructor(dispatch, options) {
      this.dispatch = dispatch;
      this.options = options; // Not currently used
      this.players = {};

      this.setupHooks()
    }

    setupHooks () {
      this.dispatch.hook(packets.spawn_user.name, packets.spawn_user.version, (event) => {
        this.players[event.gameId.toString()] = {
          gameId: event.gameId.toString(),
          name: event.name,
          allied: !!event.relation,
          job: (event.templateId % 100),
          abnormalities: {}
        };
      });
      this.dispatch.hook(packets.despawn_user.name, packets.despawn_user.version, (event) => {
        delete this.players[event.gameId.toString()]
      });
      this.dispatch.hook(packets.abnorm_begin.name, packets.abnorm_begin.version, (event) => {
        if (event.target.toString() in this.players) {
          this.players[event.target.toString()].abnormalities[event.id] = {
            id: event.id,
            stacks: event.stacks
          }
        }
      });
      this.dispatch.hook(packets.abnorm_end.name, packets.abnorm_end.version, (event) => {
        if (event.target.toString() in this.players){
          delete this.players[event.gameId].abnormalities[event.id]
        }
      });
    }
}

packets = {
  spawn_user: {
    name: "S_SPAWN_USER",
    version: 13
  },
  despawn_user: {
    name: "S_DESPAWN_USER",
    version: 3
  },
  abnorm_begin: {
    name: "S_ABNORMALITY_BEGIN",
    version: 2
  },
  abnorm_end: {
    name: "S_ABNORMALITY_END",
    version: 1
  }
};

module.exports = function Wrapper(dispatch, options={}) {
  return new EntityTrack(dispatch, options);
}