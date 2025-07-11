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

export default router;
