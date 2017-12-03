defmodule Battleship.App.Board do

  @cells_size 10

  @unknown "?"
  @water "~"
  @ship "|"
  @water_hit "O"
  @ship_hit "X"

  def new(id, name) do
    %{
      id: String.to_integer(id),
      name: name,
      cells: water_cells(),
      ships_to_place: ship_sizes(),
    }
  end

  def clear(board) do
    %{
      id: board.id,
      name: board.name,
      cells: water_cells(),
      ships_to_place: ship_sizes(),
    }
  end

  def ship_sizes do
    [5, 4, 3, 3, 2]
  end

  def water_cells do
    List.duplicate(List.duplicate(@water, 10), 10)
  end

  def sanitize(board) do
    Map.update!(board, :cells, &(sanitize_cells(&1)))
    |> Map.drop([:ships_to_place])
  end

  def sanitize_cells(cells) do
    Enum.map(cells, fn row -> sanitize_row(row) end)
  end

  def sanitize_row(row) do
    Enum.map(row, fn cell -> sanitize_cell(cell) end)
  end

  def sanitize_cell(cell) do
    case cell do
      @water -> @unknown
      @ship -> @unknown
      _ -> cell
    end
  end

  def place_ship(board, %{"size" => size, "orientation" => orient, "coords" => coords}) do
    case orient do
      "horizontal" -> Map.update!(board, :cells,
                        fn cells ->
                          place_ship_at(:horizontal, cells, size, coords)
                        end)
                     |> Map.update!(:ships_to_place,
                        fn x ->
                          Enum.drop(x, 1)
                        end)

      "vertical" -> Map.update!(board, :cells,
                      fn cells ->
                        place_ship_at(:vertical, cells, size, coords)
                      end)
                    |> Map.update!(:ships_to_place,
                         fn x ->
                           Enum.drop(x, 1)
                         end)
    end
  end

  def place_ship_at(:horizontal, cells, size, coords) do
    ship = List.duplicate(@ship, size)
    firstCell = coords["col"]
    lastCell = coords["col"] + size
    row = Enum.at(cells, coords["row"])

    row_before = Enum.slice(row, 0, firstCell)
    row_after = Enum.slice(row, lastCell..@cells_size - 1)
    result = Enum.concat(row_before, ship)
    |> Enum.concat(row_after)


    List.replace_at(cells, coords["row"], result)
  end

  def place_ship_at(:vertical, cells, size, coords) do
    first = coords["row"]
    last = coords["row"] + size - 1
    rows = Enum.to_list(first..last)

    rows_before = Enum.slice(cells, 0, first)
    rows_within = Enum.slice(cells, first..last)
    rows_after = Enum.slice(cells, (last+1)..(@cells_size-1))

    rows_within = Enum.map(rows_within, fn row ->
      List.replace_at(row, coords["col"], @ship)
    end)


    Enum.concat(rows_before, rows_within)
    |> Enum.concat(rows_after)
  end

  def can_place_ship_at?(cells, size, orient, coords) do
    case orient do
      "horizontal" ->
        end_location = coords["col"] + size - 1
        coords["col"] >= 0 && end_location < @cells_size
        && clear_path?(:horizontal, cells, size, coords)

      "vertical" ->
        end_location = coords["row"] + size - 1
        coords["row"] >= 0 && end_location < @cells_size
        && clear_path?(:vertical, cells, size, coords)
    end
  end

  def can_attack_cell?(board, %{"row" => row, "col" => col}) do
    val = get_cell_value(board.cells, row, col)
    val == @water || val == @ship
  end

  def all_ships_sunk?(board) do
    Enum.all?(board.cells, fn row ->
      Enum.all?(row, fn cell ->
        cell != @ship
      end)
    end)
  end

  def attack_cell(board, %{"row" => row, "col" => col}) do
    case get_cell_value(board.cells, row, col) do
      @ship ->
        {:hit, Map.update!(board, :cells, fn x ->
            set_cell_value(board.cells, row, col, @ship_hit)
          end)
        }
      @water ->
        {:miss, Map.update!(board, :cells, fn x ->
            set_cell_value(board.cells, row, col, @water_hit)
          end)
        }
    end
  end

  def get_cell_value(cells, row, col) do
    Enum.at(cells, row)
    |> Enum.at(col)
  end

  def set_cell_value(cells, row, col, val) do
    r = Enum.at(cells, row)
    r = List.update_at(r, col, fn _ -> val end)
    List.update_at(cells, row, fn _ -> r end)
  end

  def clear_path?(:horizontal, cells, size, coords) do
    endCol = coords["row"] + size - 1
    Enum.at(cells, coords["row"])
    |> Enum.slice(coords["row"]..endCol)
    |> Enum.all?(fn cell -> cell == @water end)
  end

  def clear_path?(:vertical, cells, size, coords) do
    endRow = coords["col"] + size - 1
    cells
    |> Enum.map(fn row -> Enum.at(row, coords["col"]) end)
    |> Enum.slice(coords["row"]..endRow)
    |> Enum.all?(fn cell -> cell == @water end)
  end

end
