defmodule BattleshipWeb.TableView do
  use BattleshipWeb, :view
  alias BattleshipWeb.TableView

  def render("index.json", %{tables: tables}) do
    %{data: render_many(tables, TableView, "table.json")}
  end

  def render("show.json", %{table: table}) do
    %{data: render_one(table, TableView, "table.json")}
  end

  def render("table.json", %{table: table}) do
    %{id: table.id, name: table.name}
  end
end
