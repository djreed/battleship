defmodule BattleshipWeb.Router do
  use BattleshipWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", BattleshipWeb do
    pipe_through :browser # Use the default browser stack

    get "/", PageController, :index
    get "/table", PageController, :index
    get "/home", PageController, :index
    get "/game", PageController, :index
  end

  # Other scopes may use custom stacks.
   scope "/api", BattleshipWeb do
     pipe_through :api
     resources "/tables", TableController, except: [:new, :edit]
     resources "/users", UserController, except: [:new, :edit]
  end
end
