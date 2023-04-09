const router = require("express").Router();
const { Category, Product } = require("../../models");

router.get("/", async (req, res) => {
  const categoriesAll = await Category.findAll({
    include: {
      model: Product,
    },
  });
  if (!categoriesAll) {
    res.status(404).json({ error: "Could Not Find Any Categories!" });
  }
  res.json(categoriesAll);
});

router.get("/:id", async (req, res) => {
  const categoryOne = await Category.findByPk(req.params.id, {
    include: {
      model: Product
    }
  });
  if (!categoryOne) {
    res.status(404).json({ error: "That Category does not exist." });
  }
  res.json(categoryOne);
});

router.post("/", async (req, res) => {
 try { 
  const categoryPost = await Category.create(req.body);
  const { productId } = req.body;

  if (productId) {
    await categoryPost.addProduct(productId);
  }
  res.json({ message: "Your Category Has Been Successfully Created!" });
} catch (err) {
  res.status(500).json(err);
}
  
});

router.put("/:id", async (req, res) => {
  // update a category by its `id` value
  try {
  const categoryPut = await Category.findByPk(req.params.id);
  const { category_name, productIds } = req.body;

  if (!categoryPut) {
    res.status(404).json({ error: "That Category Does Not Exist." })
  }
  // Updating category name
  await categoryPut.update({ category_name });

  // Removing existing products from category
  categoryPut.setProducts([]);

  if (productIds) {
    const products = await Product.findAll({
      where: {
        id: productIds
      }
    });
    await categoryPut.addProducts(products);
  }
  res.json({ message: "Your Category Has Been Successfully Updated!" })
  } catch (err) {
    res.status(500).json(err);
  }

});

router.delete("/:id", async (req, res) => {
  // delete a category by its `id` value
  try {
  const categoryDelete = await Category.destroy({
    where: {
      id: req.params.id
    }
  });
  if (!categoryDelete) {
    res.status(404).json({ error: "That Category Does Not Exist." })
  }
  res.json({ message: "Your Category Has Been Successfully Deleted!" })
  } catch (err) {
    res.status(500).json(err);
  }
})

module.exports = router;
