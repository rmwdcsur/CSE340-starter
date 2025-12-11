ALTER TABLE account
ADD COLUMN deleted INT DEFAULT 0;

CREATE TABLE account_audit (
    id SERIAL PRIMARY KEY,
    account_id INT NOT NULL,
    admin_account_id INT NOT NULL,
    old_data VARCHAR(50),
    new_data VARCHAR(50),
    date TIMESTAMP DEFAULT NOW(),

    -- Foreign keys
    CONSTRAINT fk_audit_account
      FOREIGN KEY (account_id)
      REFERENCES account(account_id)
      ON UPDATE CASCADE
      ON DELETE CASCADE,

    CONSTRAINT fk_audit_admin
      FOREIGN KEY (admin_account_id)
      REFERENCES account(account_id)
      ON UPDATE CASCADE
      ON DELETE CASCADE
);NCES account(account_id)
      ON UPDATE CASCADE
      ON DELETE CASCADE,

    CONSTRAINT fk_audit_admin
      FOREIGN KEY (admin_account_id)
      REFERENCES account(account_id)
      ON UPDATE CASCADE
      ON DELETE CASCADE
);;SET NULL
);ount(account_id)
      ON UPDATE CASCADE
      ON DELETE SET NULL
);