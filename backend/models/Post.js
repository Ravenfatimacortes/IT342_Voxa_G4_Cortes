const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Post = sequelize.define('Post', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: [1, 2000]
    }
  },
  type: {
    type: DataTypes.ENUM('survey', 'question', 'announcement', 'general'),
    defaultValue: 'general'
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [0, 200]
    }
  },
  surveyId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'surveys',
      key: 'id'
    }
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isPinned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: []
  }
}, {
  tableName: 'posts',
  timestamps: true,
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci'
});

// Associations
Post.associate = (models) => {
  Post.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  Post.belongsTo(models.Survey, { foreignKey: 'surveyId', as: 'survey' });
  Post.hasMany(models.Comment, { foreignKey: 'postId', as: 'comments' });
  Post.hasMany(models.Like, { foreignKey: 'postId', as: 'postLikes' });
};

module.exports = Post;
