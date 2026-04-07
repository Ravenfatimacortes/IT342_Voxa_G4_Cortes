const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Like = sequelize.define('Like', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  postId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'posts',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('like', 'love', 'laugh', 'wow', 'sad', 'angry'),
    defaultValue: 'like'
  }
}, {
  tableName: 'likes',
  timestamps: true,
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci',
  indexes: [
    {
      unique: true,
      fields: ['postId', 'userId']
    }
  ]
});

// Associations
Like.associate = (models) => {
  Like.belongsTo(models.Post, { foreignKey: 'postId', as: 'post' });
  Like.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
};

module.exports = Like;
