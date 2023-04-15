create TABLE person
(
    id           SERIAL PRIMARY KEY,
    username     VARCHAR(255),
    mail         VARCHAR(255),
    password     VARCHAR(255),
    refreshToken VARCHAR(255),
    likes        INTEGER [],
    dislikes     INTEGER [],
    avatar_url   VARCHAR(255)
);

create TABLE comment
(
    id              SERIAL PRIMARY KEY,
    isMajor         BOOL,
    username        VARCHAR(100),
    text            VARCHAR(102400),
    image           VARCHAR(255),
    publicationDate TIMESTAMP,
    parentOf        INTEGER [],
    likes           INTEGER,
    dislikes        INTEGER,
    gradation       INTEGER,
    author          INTEGER,

    FOREIGN KEY (author) REFERENCES person (id)
);
