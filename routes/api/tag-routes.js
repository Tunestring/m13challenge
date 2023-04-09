const router = require("express").Router();
const { Tag, Product } = require("../../models");

router.get("/", async (req, res) => {
  const tagsAll = await Tag.findAll({
    include: {
      model: Product,
    },
  });
  res.json(tagsAll);
});

router.get("/:id", async (req, res) => {
  const tagOne = await Tag.findByPk(req.params.id, {
    include: {
      model: Product,
    },
  });
  res.json(tagOne);
});

router.post("/", async (req, res) => {
    const tagPost = await Tag.create(req.body);
    const productIds = req.body.productIds;

    await tagPost.addProducts(productIds);

    res.json("Your Tag Has Been Created Successfully!");
});

router.put("/:id", async (req, res) => {

  const tagPut = await Tag.findByPk(req.params.id);
  if (!tagPut) {
    res.status(404).json({ error: "That Tag Can Not Be Found." });
  }
  const { tag_name, productIds } = req.body;
  await tagPut.setProducts([]);
  await tagPut.update({ tag_name });
  if (productIds) {
    const productsAdd = await Product.findAll({
      where: { id: productIds },
    });
    await tagPut.addProducts(productsAdd);
  }
  res.json({ message: "That Tag Has Been Updated Successfully!" });
});

router.delete("/:id", (req, res) => {
  Tag.destroy({
    where: {
      id: req.params.id,
    },
  })
    .then(() => {
      res.json({ message: "That Tag Has Been Deleted Successfully!" });
    })
    .catch((err) => {
      console.error(err);
    });
});

module.exports = router;