defmodule BattleshipWeb.GameChannel do
  use BattleshipWeb, :channel

  alias Battleship.GameAgent
  alias Battleship.App.Game

  # users join a new game
  def join("game:" <> user_id, payload, socket) do
    game_id = payload["game_id"]
    game = GameAgent.get(game_id) || Game.new(game_id, payload["params"])
    GameAgent.put(game_id, game)

    {:ok, Game.client_view(game, String.to_integer(user_id)), socket}
  end

  def handle_in("place_ship", payload, socket) do
    game_id = payload["game_id"]
    user_id = String.to_integer(payload["id"])

    game = GameAgent.get(game_id)

    with {:ok, game} <- Game.place_ship(game, payload) do
      GameAgent.put(game_id, game)
      broadcast_game_state(socket, game, user_id)
    end

    {:reply, {:ok, %{}}, socket}
  end

  #TODO on hit, swaps boards? or is it displaying wrong?
  def handle_in("attack", payload, socket) do
    game_id = payload["game_id"]
    user_id = String.to_integer(payload["id"])
    game = GameAgent.get(game_id)

    case Game.attack(game, payload) do
      {:hit, game} ->
        with {:true, game} <- Game.game_over?(game) do
          handle_game_over(game, game_id)
        else
          {:false, game} -> handle_hit(socket, game, game_id, user_id)
        end
      {:miss, game} ->
        with {:true, game} <- Game.game_over?(game) do
          handle_game_over(game, game_id)
        else
          {:false, game} -> handle_miss(socket, game, game_id, user_id)
        end
       _ ->
    end

    {:reply, {:ok, %{}}, socket}
  end

  def handle_game_over(game, game_id) do
    state_to_all(game, "new_game_state")

    game = Game.reset(game)
    GameAgent.put(game_id, game)
  end


  def handle_hit(socket, game, game_id, user_id) do
    GameAgent.put(game_id, game)
    push(socket, "new_game_state", Game.client_view(game, user_id))
  end

  def handle_miss(socket, game, game_id, user_id) do
    GameAgent.put(game_id, game)
    if game.waiting_on == 2 do
      state_to_all(game, "new_game_state")
    else
      view = Game.client_view(Game.set_status(game, "WAITING"), user_id)
      push(socket, "new_game_status", view)
    end
  end

  def broadcast_game_state(socket, game, user_id) do
    case game.status do
      "PLACING" ->
        push(socket, "new_game_state", Game.client_view(game, user_id))
      "ATTACK" ->
        state_to_all(game, "new_game_state")
      "GAMEOVER" ->
        state_to_all(game, "new_game_state")
    end
  end

  def state_to_all(game, topic) do
    p1 = game.player1.id
    p2 = game.player2.id
    BattleshipWeb.Endpoint.broadcast!("game:" <> Integer.to_string(p1),
      topic, Game.client_view(game, p1))
    BattleshipWeb.Endpoint.broadcast!("game:" <> Integer.to_string(p2),
      topic, Game.client_view(game, p2))
  end

  # Add authorization logic here as required.
  defp authorized?(_payload) do
    true
  end
end
