const Product = require('../models/Product');

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.getAll();
    res.json(products);
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getProductByBarcode = async (req, res) => {
  try {
    const product = await Product.findByBarcode(req.params.barcode);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Get product by barcode error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.searchProducts = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Search term is required' });
    }
    const products = await Product.search(q);
    res.json(products);
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.getLowStock();
    res.json(products);
  } catch (error) {
    console.error('Get low stock products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, sku, barcode, description, category, unit, purchase_price, sale_price, stock_quantity, min_stock_level, status } = req.body;

    if (!name || !sku) {
      return res.status(400).json({ error: 'Name and SKU are required' });
    }

    const existingSku = await Product.findBySku(sku);
    if (existingSku) {
      return res.status(400).json({ error: 'SKU already exists' });
    }

    const productId = await Product.create({
      name,
      sku,
      barcode: barcode || null,
      description: description || null,
      category: category || 'General',
      unit: unit || 'pcs',
      purchase_price: purchase_price || 0,
      sale_price: sale_price || 0,
      stock_quantity: stock_quantity || 0,
      min_stock_level: min_stock_level || 10,
      status: status || 'active'
    });

    res.status(201).json({ message: 'Product created successfully', productId });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { name, sku, barcode, description, category, unit, purchase_price, sale_price, stock_quantity, min_stock_level, status } = req.body;

    if (!name || !sku) {
      return res.status(400).json({ error: 'Name and SKU are required' });
    }

    const existingSku = await Product.findBySku(sku);
    if (existingSku && existingSku.id != req.params.id) {
      return res.status(400).json({ error: 'SKU already exists' });
    }

    await Product.update(req.params.id, {
      name,
      sku,
      barcode: barcode || null,
      description: description || null,
      category: category || 'General',
      unit: unit || 'pcs',
      purchase_price: purchase_price || 0,
      sale_price: sale_price || 0,
      stock_quantity: stock_quantity || 0,
      min_stock_level: min_stock_level || 10,
      status: status || 'active'
    });

    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await Product.delete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
