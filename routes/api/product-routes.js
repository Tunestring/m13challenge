const router = require("express").Router();
const { Product, Category, Tag, ProductTag } = require("../../models");

router.get("/", async (req, res) => {
  const productsAll = await Product.findAll({
    include: [
      {
        model: Category,
      },
      {
        model: Tag,
      },
    ],
  });
  res.json(productsAll);
});


router.get("/:id", async (req, res) => {
  const productOne = await Product.findByPk(req.params.id, {
    include: [
      {
        model: Category,
      },
      {
        model: Tag,
      },
    ],
  });
  res.json(productOne);
});


router.post("/", (req, res) => {
  Product.create(req.body)
    .then((product) => {
      if (req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }
      res.status(200).json({ message: "Successfully created product"});
    })
    .then((productTagIds) => res.status(200).json({ message: "Successfully created product"}))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

router.put("/:id", (req, res) => {
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      return ProductTag.findAll({ where: { product_id: req.params.id } });
    })
    .then((productTags) => {
      const productTagIds = productTags.map(({ tag_id }) => tag_id);
      const newProductTags = req.body.tagIds
        .filter((tag_id) => !productTagIds.includes(tag_id))
        .map((tag_id) => {
          return {
            product_id: req.params.id,
            tag_id,
          };
        });
      const productTagsToRemove = productTags
        .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
        .map(({ id }) => id);

      return Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    })
    .then((updatedProductTags) => res.json(updatedProductTags))
    .catch((err) => {
      res.status(400).json(err);
    });
});

router.delete("/:id", (req, res) => {
  Product.destroy({
    where: {
      id: req.params.id,
    },
  })
    .then(() => {
      res.json({ message: "Product deleted successfully" });
    })
    .catch((err) => {
      console.error(err);
    });
});

module.exports = router;
