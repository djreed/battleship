defmodule Battleship.AppTest do
  use Battleship.DataCase

  alias Battleship.App

  describe "tables" do
    alias Battleship.App.Table

    @valid_attrs %{}
    @update_attrs %{}
    @invalid_attrs %{}

    def table_fixture(attrs \\ %{}) do
      {:ok, table} =
        attrs
        |> Enum.into(@valid_attrs)
        |> App.create_table()

      table
    end

    test "list_tables/0 returns all tables" do
      table = table_fixture()
      assert App.list_tables() == [table]
    end

    test "get_table!/1 returns the table with given id" do
      table = table_fixture()
      assert App.get_table!(table.id) == table
    end

    test "create_table/1 with valid data creates a table" do
      assert {:ok, %Table{} = table} = App.create_table(@valid_attrs)
    end

    test "create_table/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = App.create_table(@invalid_attrs)
    end

    test "update_table/2 with valid data updates the table" do
      table = table_fixture()
      assert {:ok, table} = App.update_table(table, @update_attrs)
      assert %Table{} = table
    end

    test "update_table/2 with invalid data returns error changeset" do
      table = table_fixture()
      assert {:error, %Ecto.Changeset{}} = App.update_table(table, @invalid_attrs)
      assert table == App.get_table!(table.id)
    end

    test "delete_table/1 deletes the table" do
      table = table_fixture()
      assert {:ok, %Table{}} = App.delete_table(table)
      assert_raise Ecto.NoResultsError, fn -> App.get_table!(table.id) end
    end

    test "change_table/1 returns a table changeset" do
      table = table_fixture()
      assert %Ecto.Changeset{} = App.change_table(table)
    end
  end
end
