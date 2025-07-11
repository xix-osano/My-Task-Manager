import { useEffect, useState } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { jwtDecode } from 'jwt-decode';

export default function Dashboard() {
  const [boards, setBoards] = useState([]);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    // Get username from token
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      setUsername(decoded.username);
    }

    // Fetch boards
    const fetchBoards = async () => {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('http://localhost:5000/api/boards', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBoards(data);
    };
    fetchBoards();
  }, []);

   // Create a new board
  const createBoard = async () => {
    const token = localStorage.getItem('token');
    const { data } = await axios.post('http://localhost:5000/api/boards', {
      title: newBoardTitle,
      columns: [
        { title: 'Todo', tasks: [] },
        { title: 'In Progress', tasks: [] },
        { title: 'Done', tasks: [] }
      ]
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setBoards([...boards, data]);
    setNewBoardTitle('');
  };

  const handleDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const updatedBoards = JSON.parse(JSON.stringify(boards));
    const board = updatedBoards[0];

    const sourceCol = board.columns[source.droppableId];
    const destCol = board.columns[destination.droppableId];

    const [movedTask] = sourceCol.tasks.splice(source.index, 1);
    destCol.tasks.splice(destination.index, 0, movedTask);

    setBoards(updatedBoards);

    const token = localStorage.getItem("token");
    await axios.post(`http://localhost:5000/api/boards/${board._id}/drag`, {
      source,
      destination,
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const addTaskToColumn = async (colIndex) => {
    const title = prompt('Enter task title:');
    if (!title) return;

    const updated = [...boards];
    updated[0].columns[colIndex].tasks.push({ title });
    setBoards(updated);

    const token = localStorage.getItem("token");
    await axios.put(
      `http://localhost:5000/api/boards/${updated[0]._id}`,
      updated[0],
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  };

  const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };  

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Welcome, {username} 👋</h1>
        <button onClick={logout} className="bg-red-600 text-white px-4 py-2 rounded">
          Logout
        </button>
      </div>

      <div className="mb-6">
        <input
          value={newBoardTitle}
          onChange={(e) => setNewBoardTitle(e.target.value)}
          placeholder="New board title"
          className="border p-2 mr-2"
        />
        <button
          onClick={createBoard}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Create Board
        </button>
      </div>

      {boards.map((board) => (
        <div key={board._id}>
          <h2 className="text-2xl font-semibold mb-4">{board.title}</h2>
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex gap-4 overflow-x-auto">
              {board.columns.map((column, colIndex) => (
                <Droppable droppableId={`${colIndex}`} key={colIndex}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="bg-gray-100 p-4 rounded min-w-[250px] max-h-screen overflow-y-auto"
                    >
                      <h3 className="font-semibold text-lg mb-2">{column.title}</h3>

                      {column.tasks.map((task, taskIndex) => (
                        <Draggable
                          draggableId={`${colIndex}-${taskIndex}`}
                          index={taskIndex}
                          key={`${colIndex}-${taskIndex}`}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="bg-white p-3 rounded shadow mb-2"
                            >
                              <p>{task.title}</p>
                            </div>
                          )}
                        </Draggable>
                      ))}

                      {provided.placeholder}

                      <button
                        className="text-blue-500 mt-2"
                        onClick={() => addTaskToColumn(colIndex)}
                      >
                        + Add Task
                      </button>
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          </DragDropContext>
        </div>
      ))}
    </div>
  );
}
