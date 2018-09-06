class EntityTrack {
    constructor(dispatch, options) {
      this.dispatch = dispatch;
      this.options = options; // Not currently used
      this.players = {};
      this.npcs = {};
      this.filteredPlayers = {};
      this.filteredNPCs = {};
      this.setupHooks()
    }

    setupHooks () {
      // Player Hooks
      this.dispatch.hook(packets.spawn_user.name, packets.spawn_user.version, (event) => {
        this.players[event.gameId.toString()] = {
          gameId: event.gameId.toString(),
          name: event.name,
          loc: event.loc,
          allied: !!event.relation,
          job: (event.templateId % 100),
          abnormalities: {}
        };
      });
      this.dispatch.hook(packets.despawn_user.name, packets.despawn_user.version, (event) => {
        delete this.players[event.gameId.toString()]
      });

      // NPC Hooks
      this.dispatch.hook(packets.spawn_npc.name, packets.spawn_npc.version, (event) => {
        this.npcs[event.gameId.toString()] = {
          gameId: event.gameId.toString(),
          loc: event.loc,
          allied: event.relation,
          abnormalities: {}
        }
      });
      this.dispatch.hook(packets.despawn_npc.name, packets.despawn_npc.version, (event) => {
        delete this.npcs[event.gameId.toString()]
      });

      // Abnormality Hooks
      this.dispatch.hook(packets.abnorm_begin.name, packets.abnorm_begin.version, (event) => {
        if (event.target.toString() in this.players) {
          this.players[event.target.toString()].abnormalities[event.id] = {
            id: event.id,
            stacks: event.stacks
          }
        } else if (event.target.toString() in this.npcs) {
          this.npcs[event.target.toString()].abnormalities[event.id] = {
            id: event.id,
            stacks: event.stacks
          }
        }
      });
      this.dispatch.hook(packets.abnorm_end.name, packets.abnorm_end.version, (event) => {
        if (event.target.toString() in this.players){
          delete this.players[event.target.toString()].abnormalities[event.id]
        } else if (event.target.toString() in this.npcs){
          delete this.npcs[event.target.toString()].abnormalities[event.id]
        }
      });
    }
// work on filtering
    getPlayers() {

    }

    playerHasAbnormality(abnormalities) {

    }
}

filterables = {
  abnorm: {
    key: "abnormalities",
    type: INT
  }
};

// TYPES
BOOLEAN = 1;
INT = 2;

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
  },
  spawn_npc: {
    name: "S_SPAWN_NPC",
    version: 9
  },
  despawn_npc: {
    name: "S_DESPAWN_NPC",
    version: 3
  }
};

module.exports = function Wrapper(dispatch, options={}) {
  return new EntityTrack(dispatch, options);
};
