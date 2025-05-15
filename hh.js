class Action {
  constructor(id, parent_action_id) {
    this.id = id;
    this.pa_id = parent_action_id;
    this.child_actions = [];
    this.selected_action;
    this.buckets = {};
    this.total_range = "";
    this.bet_amt;
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
    this.actions = new Set();
  }
}
