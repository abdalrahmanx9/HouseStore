"""Add wishlist table

Revision ID: a1b2c3d4e5f6
Revises: ca53031120f3
Create Date: 2026-02-20 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = 'ca53031120f3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'store_wishlists',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('product_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['product_id'], ['store_products.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'product_id', name='uq_wishlist_user_product'),
    )
    op.create_index(op.f('ix_store_wishlists_id'), 'store_wishlists', ['id'], unique=False)
    op.create_index(op.f('ix_store_wishlists_user_id'), 'store_wishlists', ['user_id'], unique=False)
    op.create_index(op.f('ix_store_wishlists_product_id'), 'store_wishlists', ['product_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_store_wishlists_product_id'), table_name='store_wishlists')
    op.drop_index(op.f('ix_store_wishlists_user_id'), table_name='store_wishlists')
    op.drop_index(op.f('ix_store_wishlists_id'), table_name='store_wishlists')
    op.drop_table('store_wishlists')
