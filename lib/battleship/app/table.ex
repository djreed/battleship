defmodule Battleship.App.Table do
  use Ecto.Schema
  import Ecto.Changeset
  alias Battleship.App.Table


  schema "tables" do
    field :name, :string
    #TODO should have a list of all posted messages - need a message resource

    timestamps()
  end

  @doc false
  def changeset(%Table{} = table, attrs) do
    table
    |> cast(attrs, [:name])
    |> validate_required([])
  end
end
