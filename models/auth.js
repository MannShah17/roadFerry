class User {
  constructor(id, email, password, user_type) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.user_type = user_type;
  }
}

module.exports = User;
