import express from 'express';
import jwt from 'jsonwebtoken';
import Board from '../models/Board.js';

const router = express.Router();

function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

router.get('/', authenticate, async (req, res) => {
  const boards = await Board.find({ users: req.user.username });
  res.json(boards);
});

router.post('/', authenticate, async (req, res) => {
  const board = new Board({ ...req.body, users: [req.user.username] });
  await board.save();
  res.status(201).json(board);
});

router.put('/:id', authenticate, async (req, res) => {
  const board = await Board.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(board);
});

router.post('/:id/drag', authenticate, async (req, res) => {
  const { source, destination } = req.body;

  const board = await Board.findById(req.params.id);
  if (!board) return res.status(404).send("Board not found");

  const sourceCol = board.columns[source.droppableId];
  const destCol = board.columns[destination.droppableId];

  const [movedTask] = sourceCol.tasks.splice(source.index, 1);
  destCol.tasks.splice(destination.index, 0, movedTask);

  board.activity.push(`${req.user.username} moved "${movedTask.title}"`);
  await board.save();

  res.status(200).json(board);
});

export default router;
