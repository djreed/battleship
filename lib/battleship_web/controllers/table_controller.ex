defmodule BattleshipWeb.TableController do
  use BattleshipWeb, :controller

  alias Battleship.App
  alias Battleship.App.Table

  action_fallback BattleshipWeb.FallbackController

  def index(conn, _params) do
    tables = App.list_tables()
    render(conn, "index.json", tables: tables)
  end

  def create(conn, %{"table" => table_params}) do
    with {:ok, %Table{} = table} <- App.create_table(table_params) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", table_path(conn, :show, table))
      |> render("show.json", table: table)
    end
  end

  def show(conn, %{"id" => id}) do
    table = App.get_table!(id)
    render(conn, "show.json", table: table)
  end

  def update(conn, %{"id" => id, "table" => table_params}) do
    table = App.get_table!(id)

    with {:ok, %Table{} = table} <- App.update_table(table, table_params) do
      render(conn, "show.json", table: table)
    end
  end

  def delete(conn, %{"id" => id}) do
    table = App.get_table!(id)
    with {:ok, %Table{}} <- App.delete_table(table) do
      send_resp(conn, :no_content, "")
    end
  end
end
