defmodule Battleship.App.Game do
  alias Battleship.App.Board
  alias BattleshipWeb.Endpoint

  # create a new game
  # params: {from_id, from_name, to_id, to_name}
  def new(game_id, params) do
    %{
      game_id: game_id,
      status: "PLACING",
      player1: Board.new(params["to_id"], params["to_name"]),
      player2: Board.new(params["from_id"], params["from_name"]),
      winner: "",
      waiting_on: 2
    }
  end

  def reset(game) do
    %{
      game_id: game.game_id,
      status: "PLACING",
      player1: Board.clear(game.player1),
      player2: Board.clear(game.player2),
      winner: "",
      waiting_on: 2
    }
  end

  # returns necessary info for client
  # sanitizes opponent board to known values
  def client_view(game, client_id) do
    view = %{ status: game.status, game_id: game.game_id, winner: game.winner }

    if game.player1.id == client_id do
      view
      |> Map.put(:player, game.player1)
      |> Map.put(:opponent, Board.sanitize(game.player2))
    else
      view
      |> Map.put(:player, game.player2)
      |> Map.put(:opponent, Board.sanitize(game.player1))
    end
  end

  #player with id 'id' attacks opponent at coords
  def attack(game, %{"id" => id, "coords" => coords}) do
    id = String.to_integer(id)
    cond do
      id == game.player1.id && Board.can_attack?(game.player2, coords) ->
        attack(game, id, game.player2, coords)
      id == game.player2.id && Board.can_attack?(game.player1, coords) ->
        attack(game, id, game.player1, coords)
      true -> {:error, game}
    end
  end

  def attack(game, attacker_id, defender, coords) do
    case Board.attack(defender, coords) do
      {:hit, board} ->
        game = update_board(game, defender.id, board)
        {:hit, game}
      {:miss, board} ->
        game = update_board(game, defender.id, board)
        |> set_waiting_on(attacker_id)
        {:miss, game}
    end
  end


  def update_board(game, id, board) do
    cond do
      id == game.player1.id ->
        Map.update!(game, :player1, fn x -> board end)
      id == game.player2.id ->
        Map.update!(game, :player2, fn x -> board end)
      true -> game
    end
  end

  def set_status(game, status) do
    Map.update!(game, :status, fn _ -> status end)
  end

  #toDO PRINTS HERE
  def game_over?(game) do
    p1 = Board.all_sunk?(game.player1)
    p2 = Board.all_sunk?(game.player2)
    both = p1 && p2

    IO.puts("game")
    IO.inspect(game)
    IO.puts("bools")
    IO.inspect(p1)
    IO.inspect(p2)
    cond do
      game.waiting_on == 1 && (!p1 || !p2) ->
        IO.puts("not done")
        {:false, game}
      both ->
        IO.puts("done - both")
        {:true, set_winner(game, "DRAW")}
      p1 ->
        IO.puts("done p1")
        {:true, set_winner(game, game.player1.name)}
      p2 ->
        IO.puts("done p2")
        {:true, set_winner(game, game.player2.name)}
      true -> {:false, game}
    end
  end

  def set_winner(game, winner) do
    game
    |> Map.update!(:status, fn x -> "GAMEOVER" end)
    |> Map.update!(:winner, fn _ -> winner end)
  end

  def place_ship(game, %{"id" => id, "ship" => ship}) do
    id = String.to_integer(id)
    cond do
      id == game.player1.id ->
        if Board.can_place?(game.player1.grid, ship["size"], ship["orientation"], ship["coords"]) do
          game = Map.update!(game, :player1, fn board -> Board.place_ship(board, ship) end)
          game = set_placing_status(game, game.player1)
          {:ok, game}
        else
          {:error, game}
        end

      id == game.player2.id ->
        if Board.can_place?(game.player2.grid, ship["size"], ship["orientation"], ship["coords"]) do
          game = Map.update!(game, :player2, fn board -> Board.place_ship(board, ship) end)
          game = set_placing_status(game, game.player2)
          {:ok, game}
        else
          {:error, game}
        end

      true ->
        {:error, game}
    end
  end

  def set_placing_status(game, player) do
    if Enum.count(player.ships_to_place) == 0 do
      case game.waiting_on do
        1 ->
          game
          |> Map.update!(:waiting_on, fn x -> 2 end)
          |> set_status("ATTACK")

        2 ->
          game = game
          |> Map.update!(:waiting_on, fn x -> 1 end)
          send_waiting(player.id)
          game
        _ ->
          game
      end
    else
      game
    end
  end


  def set_waiting_on(game, player_id) do
    case game.waiting_on do
      1 ->
        game
        |> Map.update!(:waiting_on, fn x -> 2 end)

      2 ->
        game
        |> Map.update!(:waiting_on, fn x -> 1 end)
      _ -> game
    end
  end

  def send_waiting(player_id) do
    IO.puts("sending waiting status")
    Endpoint.broadcast!("game:" <> Integer.to_string(player_id),
      "new_game_status", %{status: "WAITING"})
  end

end
