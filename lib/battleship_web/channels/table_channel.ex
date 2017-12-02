defmodule BattleshipWeb.TableChannel do
  use BattleshipWeb, :channel

  alias Battleship.{App, Presence, Account}
  alias BattleshipWeb.{TableView, UserView}
  alias Battleship.Account.User
  alias Battleship.App.Table

  def join("table:lobby", payload, socket) do
    if authorized?(payload) do
      {:ok, socket}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  def join("table:" <> id, payload, socket) do
    socket = assign(socket, :user, payload["user"]) # track user id
    send(self(), :after_join) # track info
    if authorized?(payload) do
      table = App.get_table!(id)
      if table do
        resp = TableView.render("show.json", %{table: table})
        {:ok, resp, socket}
      else
        {:error, %{reason: "invalid code"}}
      end
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  def handle_in("create_table", payload, socket) do
    with {:ok, %Table{} = table} <- App.create_table(%{name: payload["tableName"]}) do
      resp = TableView.render("show.json", %{table: table})
      {:reply, {:ok, resp}, socket}
    end
  end

  def handle_in("create_user", payload, socket) do
    with {:ok, %User{} = user} <- Account.create_user(%{name: payload["username"]}) do
      resp = UserView.render("show.json", %{user: user})
      {:reply, {:ok, resp}, socket}
    end
  end

  def handle_in("new_msg", payload, socket) do
    broadcast(socket, "new_msg", payload)
    {:reply, {:ok, payload}, socket}
  end

  # users issue challenge
  # broadcast to entire table
  # payload is in form {to_id, to_name, from_id, from_name}
  def handle_in("issue_challenge", payload, socket) do
    broadcast(socket, "challenge_issued", payload)
    {:reply, {:ok, payload}, socket}
  end

  def handle_in("accept_challenge", payload, socket) do
    broadcast(socket, "challenge_accepted", payload)
    {:reply, {:ok, payload}, socket}
  end

  # Add authorization logic here as required.
  defp authorized?(_payload) do
    true
  end


  def handle_info(:after_join, socket) do
    push(socket, "presence_state", Presence.list(socket))
    {:ok, _} = Presence.track(socket, socket.assigns.user["id"], %{
      joined_at: System.system_time(:seconds),
      name: socket.assigns.user["name"]
    })
    {:noreply, socket}
  end

end
