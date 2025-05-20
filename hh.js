class Action {
  constructor(id, player_id, parent_id) {
    this.id = id;
    this.player_id;
    this.parent_game_action_id; // points to the game's immediate preceeding action
    this.parent_player_action_id; // points to this action's player's immediate preceeding action
    this.child_actions = [];
    this.selected_action;
    this.buckets = {};
    this.starting_range = "";
    this.bet_amt;
    this.pot_size = 0;
  }
}

class HandHistory {
  constructor() {
    this.player_id;
    this.history_id;
    this.num_of_players;
    this.btn_seat_num;
    this.bb; // big blind
    this.sb; // small blind
    this.straddle;
    this.straddle_seat_num;
    this.stacks = {};
    this.root_action_id;
    this.actions = {}; // key is Action.id
    this.players = {}; // key is player_id
  }
}

class PlayerHistory {}
