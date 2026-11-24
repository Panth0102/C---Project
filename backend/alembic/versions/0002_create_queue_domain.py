"""create queue domain tables: services, barbers, queues, queue_services

Revision ID: 0002
Revises: 0001
Create Date: 2024-01-02 00:00:00.000000
"""

from __future__ import annotations
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── services ──────────────────────────────────────────────────────────────
    op.create_table(
        "services",
        sa.Column("id",          sa.Integer(),     nullable=False),
        sa.Column("name",        sa.String(255),   nullable=False),
        sa.Column("price",       sa.Integer(),     nullable=False),
        sa.Column("duration",    sa.Integer(),     nullable=False),
        sa.Column("description", sa.Text(),        nullable=True),
        sa.Column("icon",        sa.String(10),    nullable=True),
        sa.Column("is_active",   sa.Boolean(),     nullable=False, server_default=sa.text("true")),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_services_id", "services", ["id"])

    # ── barbers ───────────────────────────────────────────────────────────────
    op.create_table(
        "barbers",
        sa.Column("id",        sa.Integer(),   nullable=False),
        sa.Column("name",      sa.String(255), nullable=False),
        sa.Column("specialty", sa.String(255), nullable=True),
        sa.Column("status",    sa.Enum("available", "on_break", "offline", name="barberstatus"),
                  nullable=False, server_default="available"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_barbers_id", "barbers", ["id"])

    # ── queues ────────────────────────────────────────────────────────────────
    op.create_table(
        "queues",
        sa.Column("id",                     sa.Integer(),   nullable=False),
        sa.Column("token",                  sa.String(20),  nullable=False),
        sa.Column("customer_name",          sa.String(255), nullable=False),
        sa.Column("phone",                  sa.String(15),  nullable=False),
        sa.Column("status",
                  sa.Enum("waiting","called","in_service","completed","cancelled","no_show",
                           name="queuestatus"),
                  nullable=False, server_default="waiting"),
        sa.Column("barber_id",              sa.Integer(),   nullable=True),
        sa.Column("barber_locked",          sa.Boolean(),   nullable=False, server_default=sa.text("false")),
        sa.Column("position",               sa.Integer(),   nullable=True),
        sa.Column("estimated_wait_minutes", sa.Integer(),   nullable=False, server_default="0"),
        sa.Column("called_at",    sa.DateTime(timezone=True), nullable=True),
        sa.Column("started_at",   sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at",   sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text("now()")),
        sa.Column("updated_at",   sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["barber_id"], ["barbers.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("token"),
    )
    op.create_index("ix_queues_id",       "queues", ["id"])
    op.create_index("ix_queues_token",    "queues", ["token"], unique=True)
    op.create_index("ix_queues_phone",    "queues", ["phone"])
    op.create_index("ix_queues_status",   "queues", ["status"])
    op.create_index("ix_queues_barber",   "queues", ["barber_id"])

    # ── queue_services join table ─────────────────────────────────────────────
    op.create_table(
        "queue_services",
        sa.Column("queue_id",   sa.Integer(), nullable=False),
        sa.Column("service_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["queue_id"],   ["queues.id"],   ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["service_id"], ["services.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("queue_id", "service_id"),
    )

    # ── seed data ─────────────────────────────────────────────────────────────
    op.execute("""
        INSERT INTO services (name, price, duration, description, icon, is_active) VALUES
        ('Classic Haircut',   250, 30, 'Precision scissor cut with hot towel finish',               '✂️', true),
        ('Royal Shave',       350, 45, 'Straight-razor shave with pre-shave oil & post balm',       '🪒', true),
        ('Beard Trim & Shape',200, 20, 'Expert sculpting and line-work for your beard',             '✦',  true),
        ('Hair & Beard Combo',450, 50, 'Full haircut plus beard trim — the works',                  '⚜️', true),
        ('Head Massage',      150, 15, 'Traditional oil massage for relaxation',                    '◈',  true),
        ('Hair Colour',       600, 60, 'Natural or fashion colour with conditioning treatment',     '✦',  true)
    """)

    op.execute("""
        INSERT INTO barbers (name, specialty, status, is_active) VALUES
        ('Rajan Mehta', 'Classic Cuts & Shaves',    'available', true),
        ('Arjun Shah',  'Modern Fades & Colour',    'available', true),
        ('Dev Patel',   'Beard Architecture',        'on_break',  true),
        ('Kiran Joshi', 'Traditional Techniques',   'available', true)
    """)


def downgrade() -> None:
    op.drop_table("queue_services")
    op.drop_index("ix_queues_barber",  table_name="queues")
    op.drop_index("ix_queues_status",  table_name="queues")
    op.drop_index("ix_queues_phone",   table_name="queues")
    op.drop_index("ix_queues_token",   table_name="queues")
    op.drop_index("ix_queues_id",      table_name="queues")
    op.drop_table("queues")
    op.drop_index("ix_barbers_id",     table_name="barbers")
    op.drop_table("barbers")
    op.drop_index("ix_services_id",    table_name="services")
    op.drop_table("services")
    op.execute("DROP TYPE IF EXISTS queuestatus")
    op.execute("DROP TYPE IF EXISTS barberstatus")
