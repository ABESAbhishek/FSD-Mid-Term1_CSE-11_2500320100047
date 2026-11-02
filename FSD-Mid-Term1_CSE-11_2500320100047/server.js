const express = require("express");
const app = express();

app.use(express.json());

const PORT = 3000;

let books = [];

app.post("/api/books", (req, res) => {
    const { id, title, author, category, quantity } = req.body;

    if (!id || !title || !author || !category || quantity === undefined) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    if (!Number.isInteger(quantity) || quantity < 0) {
        return res.status(400).json({
            message: "Invalid quantity"
        });
    }

    if (books.find(b => String(b.id) === String(id))) {
        return res.status(409).json({
            message: "Book ID already exists"
        });
    }

    const newBook = {
        id,
        title,
        author,
        category,
        quantity,
        available: quantity
    };

    books.push(newBook);

    res.status(201).json({
        message: "Book added successfully",
        book: newBook
    });
});

app.get("/api/books/search", (req, res) => {
    const q = (req.query.q || "").toLowerCase();

    if (!q) {
        return res.status(400).json({
            message: "Search query is required"
        });
    }

    const result = books.filter(book =>
        book.title.toLowerCase().includes(q) ||
        book.author.toLowerCase().includes(q) ||
        book.category.toLowerCase().includes(q)
    );

    res.status(200).json(result);
});

app.get("/api/books", (req, res) => {
    res.status(200).json(books);
});

app.get("/api/books/:id", (req, res) => {
    const book = books.find(
        b => String(b.id) === req.params.id
    );

    if (!book) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    res.status(200).json(book);
});

app.put("/api/books/:id", (req, res) => {
    const book = books.find(
        b => String(b.id) === req.params.id
    );

    if (!book) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    const { title, author, category, quantity } = req.body;

    if (quantity !== undefined &&
        (!Number.isInteger(quantity) ||
        quantity < 0 ||
        quantity < book.quantity - book.available)) {
        return res.status(400).json({
            message: "Invalid quantity"
        });
    }

    if (title !== undefined) book.title = title;
    if (author !== undefined) book.author = author;
    if (category !== undefined) book.category = category;

    if (quantity !== undefined) {
        const issued = book.quantity - book.available;
        book.quantity = quantity;
        book.available = quantity - issued;
    }

    res.status(200).json({
        message: "Book updated successfully",
        book
    });
});

app.delete("/api/books/:id", (req, res) => {
    const index = books.findIndex(
        b => String(b.id) === req.params.id
    );

    if (index === -1) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    const deletedBook = books.splice(index, 1);

    res.status(200).json({
        message: "Book deleted successfully",
        book: deletedBook[0]
    });
});

app.post("/api/books/:id/issue", (req, res) => {
    const book = books.find(
        b => String(b.id) === req.params.id
    );

    if (!book) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    if (book.available <= 0) {
        return res.status(400).json({
            message: "No copies available"
        });
    }

    book.available--;

    res.status(200).json({
        message: "Book issued successfully",
        book
    });
});

app.post("/api/books/:id/return", (req, res) => {
    const book = books.find(
        b => String(b.id) === req.params.id
    );

    if (!book) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    if (book.available >= book.quantity) {
        return res.status(400).json({
            message: "No issued copies to return"
        });
    }

    book.available++;

    res.status(200).json({
        message: "Book returned successfully",
        book
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});